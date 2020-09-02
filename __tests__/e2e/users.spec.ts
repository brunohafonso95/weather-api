import httpStatus from 'http-status-codes';

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
      const newUser = await UserModel.findOne({ email: user.email });
      await expect(
        AuthService.compareHash(user.password, newUser?.password as string),
      ).resolves.toBeTruthy();
      expect(body).toEqual(
        expect.objectContaining({ name: user.name, email: user.email }),
      );
    });

    it('should return an error when there is an validation error', async () => {
      const user = {
        email: 'john@mail.com',
        password: '1234',
      };

      const { body, status } = await global.testRequest
        .post('/api/v1/users')
        .send(user);
      expect(status).toBe(httpStatus.BAD_REQUEST);
      expect(body).toEqual({
        code: httpStatus.BAD_REQUEST,
        error: httpStatus.getStatusText(httpStatus.BAD_REQUEST),
        message: 'User validation failed: name: Path `name` is required.',
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
        error: httpStatus.getStatusText(httpStatus.CONFLICT),
        message:
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
        error: httpStatus.getStatusText(httpStatus.UNAUTHORIZED),
        message: 'User Not Found',
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
        error: httpStatus.getStatusText(httpStatus.UNAUTHORIZED),
        message: 'The user/password is wrong',
      });
    });
  });

  describe('when getting the user information', () => {
    it('should return 404 unsing an token of an user that does not exists', async () => {
      const user = {
        id: 'fake-id',
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const token = AuthService.generateToken(user);
      const { body } = await global.testRequest
        .get('/api/v1/users/me')
        .set('x-access-token', token);

      expect(body).toEqual({
        code: httpStatus.NOT_FOUND,
        error: httpStatus.getStatusText(httpStatus.NOT_FOUND),
        message: 'User Not Found',
      });
    });

    it('should return the user information', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const newUser = await new UserModel(user).save();
      const token = AuthService.generateToken(newUser.toJSON());
      const { status, body } = await global.testRequest
        .get('/api/v1/users/me')
        .set('x-access-token', token);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toMatchObject(
        JSON.parse(
          JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
          }),
        ),
      );
    });
  });
});
