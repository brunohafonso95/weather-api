import httpStatus from 'http-status-codes';

import BeachModel from '@src/models/Beach';
import UserModel from '@src/models/User';
import AuthService from '@src/services/AuthService';

describe('Beaches functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@mail.com',
    password: '1234',
  };

  let token: string;

  beforeEach(async () => {
    await BeachModel.deleteMany({});
    await UserModel.deleteMany({});
    const newUser = await new UserModel(defaultUser).save();
    token = AuthService.generateToken(newUser.toJSON());
  });

  afterAll(async () => {
    await BeachModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  describe('when creating a beach', () => {
    it('should create a new beach', async () => {
      const newBeach = {
        lat: 33.4567,
        lng: 46.43243,
        name: 'Ubatuba',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/api/v1/beaches')
        .set('x-access-token', token)
        .send(newBeach);
      expect(response.status).toBe(httpStatus.CREATED);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });

    it('should 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 46.43243,
        name: 'Ubatuba',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/api/v1/beaches')
        .set('x-access-token', token)
        .send(newBeach);
      expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
      expect(response.body).toEqual({
        code: httpStatus.UNPROCESSABLE_ENTITY,
        error: httpStatus.getStatusText(httpStatus.UNPROCESSABLE_ENTITY),
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" at path "lat"',
      });
    });

    it('should 500 when there is a unexpected database error', async () => {
      jest
        .spyOn(BeachModel.prototype, 'save')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('fail to create beach')),
        );

      const newBeach = {
        lat: 'invalid_string',
        lng: 46.43243,
        name: 'Ubatuba',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/api/v1/beaches')
        .set('x-access-token', token)
        .send(newBeach);
      expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        code: httpStatus.INTERNAL_SERVER_ERROR,
        error: httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
        message: 'Something went wrong',
      });
    });
  });
});
