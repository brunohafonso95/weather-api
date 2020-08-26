import httpStatus from 'http-status-codes';

import AuthService from '@src/services/AuthService';

import authMiddleware from '../authMiddleware';

describe('Auth Middleware unit test', () => {
  it('should verify the jwt and call the next middleware', async () => {
    const jwtToken = AuthService.generateToken({ data: 'fake' });
    const reqFake = {
      headers: {
        'x-access-token': jwtToken,
      },
    };

    const resFake = {};
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(nextFake).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED when the jwt is invalid of have a problem during the validation', async () => {
    const reqFake = {
      headers: {
        'x-access-token': 'invalid_token',
      },
    };

    const jsonMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        json: jsonMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(
      reqFake,
      resFake as { [key: string]: number | string | boolean | jest.Mock },
      nextFake,
    );
    expect(resFake.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({
      code: httpStatus.UNAUTHORIZED,
      error: 'jwt malformed',
    });
  });

  it('should return UNAUTHORIZED when the jwt token is not provided', async () => {
    const reqFake = {
      headers: {},
    };

    const jsonMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        json: jsonMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(
      reqFake,
      resFake as { [key: string]: number | string | boolean | jest.Mock },
      nextFake,
    );
    expect(resFake.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({
      code: httpStatus.UNAUTHORIZED,
      error: 'jwt token not provided',
    });
  });
});
