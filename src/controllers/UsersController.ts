import { Controller, Post, Get, Middleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import authMiddleware from '@src/middlewares/authMiddleware';
import UserModel from '@src/models/User';
import AuthService from '@src/services/AuthService';

import BaseController from './BaseController';

@Controller('api/v1/users')
export default class UsersController extends BaseController {
  /**
   * POST /users
   * @tag Users
   * @summary Creates a user.
   * @description Create a new User
   * @bodyContent {User} application/json
   * @bodyRequired
   * @response 201 - The user has been created
   * @responseContent {UserCreatedResponse} 201.application/json
   * @response 400 - Invalid parameters
   * @responseContent {Error} 400.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
   */
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    const newUser = new UserModel(req.body);
    await newUser.save();
    this.sendDefaulResponse(res, {
      code: httpStatus.CREATED,
      payload: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  }

  /**
   * GET /users/me
   * @security apiKey
   * @tag Users
   * @summary Get the profile of the authenticated user.
   * @description Get the profile of the token's owner
   * @response 200 - The user information
   * @responseContent {UserProfileResponse} 200.application/json
   * @response 404 - Not Found
   * @responseContent {NotFoundError} 404.application/json
   * @response 401 - Unauthorized
   * @responseContent {AuthenticationError} 401.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
   */
  @Get('me')
  @Middleware(authMiddleware)
  public async getUserInformationFromToken(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const email = req.decoded?.email;
    const user = await UserModel.findOne({ email }).select('id name email');

    if (!user) {
      return this.sendErrorResponse(res, {
        code: httpStatus.NOT_FOUND,
        message: 'User Not Found',
      });
    }

    return this.sendDefaulResponse(res, {
      code: httpStatus.OK,
      payload: user,
    });
  }

  /**
   * POST /users/authenticate
   * @tag Users
   * @summary Authenticate the user on API.
   * @description Authenticate the user on the API generating a JWT token
   * @bodyContent {UserAuth} application/json
   * @bodyRequired
   * @response 200 - The user has been authenticate and the JWT returned
   * @responseContent {AuthenticatedUserResponse} 200.application/json
   * @response 400 - Invalid parameters
   * @responseContent {Error} 400.application/json
   * @response 401 - Unauthorized
   * @responseContent {AuthenticationError} 401.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
   */
  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: httpStatus.UNAUTHORIZED,
        message: 'User Not Found',
      });
    }

    if (!(await AuthService.compareHash(password, user.password))) {
      return this.sendErrorResponse(res, {
        code: httpStatus.UNAUTHORIZED,
        message: 'The user/password is wrong',
      });
    }

    const token = await AuthService.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return this.sendDefaulResponse(res, {
      code: httpStatus.OK,
      payload: { id: user.id, name: user.name, email: user.email, token },
    });
  }
}
