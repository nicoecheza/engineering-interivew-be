import { MongoDataSource } from 'apollo-datasource-mongodb';
import { ObjectId, OptionalId } from 'mongodb';

enum Status {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
  Archived = 'archived',
}

interface Task {
  _id: ObjectId;
  title: string;
  description?: string;
  status: Status;
  createdBy: string;
}

export default class Tasks extends MongoDataSource<OptionalId<Task>> {
  private getCurrentSession() {
    return this.context.session;
  }
  getTasks() {
    const session = this.getCurrentSession();
    if (!session) return [];
    return this.findByFields({ createdBy: session.email });
  }
  async getTask({ id }: { id: string }) {
    const session = this.getCurrentSession();
    if (!session) return null;
    const tasks = await this.findByFields({
      _id: new ObjectId(id),
      createdBy: session.email,
    });
    return tasks[0];
  }
  async createTask(task: Omit<Task, '_id' | 'createdBy'>) {
    const session = this.getCurrentSession();
    if (!session) return null;
    const newTask = {
      ...task,
      _id: new ObjectId(),
      createdBy: session.email,
    };
    await this.collection.insertOne(newTask);
    return newTask;
  }
  async updateTask({ id, status }: { id: string, status: Task['status'] }) {
    const task = await this.getTask({ id });
    if (!task) return null;

    await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    return { ...task, status };
  }
}
