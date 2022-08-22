import request from 'supertest';

import { db, url } from '../setup';
import { Collections } from '../../../db';
import { createUserAndLogin, getError } from '../utils';
import { ObjectId } from 'mongodb';

export const queries = {
  getTasks: `query getTasks {
    tasks {
      _id,
      title,
      status
    }
  }`
};

export const mutations = {
  createTask: `mutation createTask($title: String!, $status: Status!, $description: String) {
    createTask(title: $title, status: $status, description: $description) {
      _id,
      title,
      status,
      description,
      createdBy,
    }
  }`,
  updateTask: `mutation updateTask($id: String!, $status: Status!) {
    updateTask(id: $id, status: $status) {
      title,
      status,
      description,
      createdBy
    }
  }`,
};

describe('tasks', () => {
  const user = {
    email: 'test@test.com',
    password: '123',
  };
  let authenticatedRequest: (jwt?: string) => request.Test;

  beforeAll(async () => {
    const response = await createUserAndLogin(url, user);
    const jwt = response.body.data.login;
    authenticatedRequest = (customJWT?: string) => request(url)
      .post('/')
      .set('Authorization', `Bearer ${customJWT || jwt}`);
  });

  afterEach(async () => {
    await db.collection(Collections.Tasks).deleteMany({});
  });

  it('should create a task', async () => {
    const mutationCreateTask = {
      query: mutations.createTask,
      variables: {
        title: 'test',
        status: 'done',
        description: 'some-description',
      },
    };
    const response = await authenticatedRequest().send(mutationCreateTask);
    const { _id, ...newTask } = response.body.data.createTask;
    const task = await db.collection(Collections.Tasks).findOne({
      _id: new ObjectId(_id),
    }, { projection: { _id: 0 } });

    const savedTask = {
      ...mutationCreateTask.variables,
      createdBy: user.email,
    };

    const error = getError(response);
    expect(error).toBeUndefined();
    expect(newTask).toEqual(savedTask);
    expect(task).toEqual(savedTask);
  });

  it('should update a task', async () => {
    const mutationCreateTask = {
      query: mutations.createTask,
      variables: {
        title: 'test',
        status: 'todo',
        description: 'some-description',
      },
    };
    const createResponse = await authenticatedRequest().send(mutationCreateTask);
    const { _id } = createResponse.body.data.createTask;

    const mutationUpdateTask = {
      query: mutations.updateTask,
      variables: { id: _id, status: 'archived' },
    };

    const updateResponse = await authenticatedRequest().send(mutationUpdateTask);
    const responseTask = updateResponse.body.data.updateTask;
    const task = await db.collection(Collections.Tasks).findOne({
      _id: new ObjectId(_id),
    }, { projection: { _id: 0 } });

    const updatedTask = {
      ...mutationCreateTask.variables,
      status: mutationUpdateTask.variables.status,
      createdBy: user.email,
    };

    const error = getError(updateResponse);
    expect(error).toBeUndefined();
    expect(responseTask).toEqual(updatedTask);
    expect(task).toEqual(updatedTask);
  });

  it('should not update another user\'s task', async () => {
    const response = await createUserAndLogin(url, {
      email: 'test2@test.com',
      password: '1234',
    });
    const otherUserJWT = response.body.data.login;
    const mutationCreateTask = {
      query: mutations.createTask,
      variables: {
        title: 'test',
        status: 'todo',
        description: 'some-description',
      },
    };
    const createResponse = await authenticatedRequest().send(mutationCreateTask);
    const { _id } = createResponse.body.data.createTask;

    const mutationUpdateTask = {
      query: mutations.updateTask,
      variables: { id: _id, status: 'archived' },
    };

    const updateResponse = await authenticatedRequest(otherUserJWT).send(mutationUpdateTask);
    const responseTask = updateResponse.body.data.updateTask;
    const task = await db.collection(Collections.Tasks).findOne({
      _id: new ObjectId(_id),
    }, { projection: { _id: 0 } });

    const updatedTask = {
      ...mutationCreateTask.variables,
      createdBy: user.email,
    };

    const error = getError(updateResponse);
    expect(error).toBeUndefined();
    expect(responseTask).toBe(null);
    expect(task).toEqual(updatedTask);
  });

  it('should get all current user\'s tasks', async () => {
    const response = await createUserAndLogin(url, {
      email: 'test2@test.com',
      password: '1234',
    });
    const otherUserJWT = response.body.data.login;
    const newTask = {
      status: 'todo',
      description: 'some-description',
    };
    const mutationCreateTaskWithTitle = (title = 'some-task') => ({
      query: mutations.createTask,
      variables: { ...newTask, title },
    });

    await Promise.all([
      authenticatedRequest(otherUserJWT).send(mutationCreateTaskWithTitle()),
      authenticatedRequest().send(mutationCreateTaskWithTitle('another-task')),
      authenticatedRequest().send(mutationCreateTaskWithTitle('another-another-task')),
    ]);

    const queryGetTasks = { query: queries.getTasks };

    const getResponse = await authenticatedRequest().send(queryGetTasks);
    const { tasks } = getResponse.body.data;

    const error = getError(getResponse);
    expect(error).toBeUndefined();
    expect(tasks.length).toBe(2);
    expect(tasks[0].title).toBe('another-task');
    expect(tasks[1].title).toBe('another-another-task');
  });
});
