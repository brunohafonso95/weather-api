import httpStatus from 'http-status';

import UserModel from '@src/models/User';
import AuthService from '@src/services/AuthService';

describe('Users functional tests', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
  });

  describe('when creating a user', () => {
    it('should create a new user with encrypted password', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const { body, status } = await global.testRequest
        .post('/api/v1/users')
        .send(user);
      expect(status).toBe(httpStatus.CREATED);
      await expect(
        AuthService.compareHash(user.password, body.password),
      ).resolves.toBeTruthy();
      expect(body).toEqual(
        expect.objectContaining({ ...user, password: expect.any(String) }),
      );
    });

    it('should return 422 when there is an validation error', async () => {
      const user = {
        email: 'john@mail.com',
        password: '1234',
      };

      const { body, status } = await global.testRequest
        .post('/api/v1/users')
        .send(user);
      expect(status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
      expect(body).toEqual({
        code: httpStatus.UNPROCESSABLE_ENTITY,
        error: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('should return 409 when try to created a new user with and duplicated email', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const newUser = new UserModel(user);
      await newUser.save();

      const { body, status } = await global.testRequest
        .post('/api/v1/users')
        .send(user);
      expect(status).toBe(httpStatus.CONFLICT);
      expect(body).toEqual({
        code: httpStatus.CONFLICT,
        error:
          'User validation failed: email: email already exists on database',
      });
    });
  });

  describe('when authenticating the user', () => {
    it('should return the json web token for a valid user', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      await new UserModel(user).save();
      const { body } = await global.testRequest
        .post('/api/v1/users/authenticate')
        .send({ email: user.email, password: user.password });

      expect(body).toEqual(
        expect.objectContaining({ token: expect.any(String) }),
      );
    });

    it('should return 401 with an user that does not exists', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const { body } = await global.testRequest
        .post('/api/v1/users/authenticate')
        .send({ email: user.email, password: user.password });

      expect(body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        error: 'User Not Found',
      });
    });

    it('should return 401 with user that exists but with wrong password', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      await new UserModel(user).save();
      const { body } = await global.testRequest
        .post('/api/v1/users/authenticate')
        .send({ email: user.email, password: 'different password' });

      expect(body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        error: 'The user/password is wrong',
      });
    });
  });
});
