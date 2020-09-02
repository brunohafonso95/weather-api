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

    it('should return an error when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 'invalid_string',
        name: 'Ubatuba',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/api/v1/beaches')
        .set('x-access-token', token)
        .send(newBeach);
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        error: httpStatus.getStatusText(httpStatus.BAD_REQUEST),
        message:
          'request.body.lat should be number, request.body.lng should be number',
      });
    });

    it('should 500 when there is a unexpected database error', async () => {
      jest
        .spyOn(BeachModel.prototype, 'save')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('fail to create beach')),
        );

      const newBeach = {
        lat: 46.43243,
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
        message: 'fail to create beach',
      });
    });
  });
});
