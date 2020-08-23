import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import UserModel from '@src/models/User';
import AuthService from '@src/services/AuthService';

import BaseController from './BaseController';

@Controller('api/v1/users')
export default class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const newUser = new UserModel(req.body);
      await newUser.save();
      res.status(httpStatus.CREATED).json(newUser);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ code: httpStatus.UNAUTHORIZED, error: 'User Not Found' });
    }

    if (!(await AuthService.compareHash(password, user.password))) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        code: httpStatus.UNAUTHORIZED,
        error: 'The user/password is wrong',
      });
    }

    const token = await AuthService.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return res.json({ id: user.id, name: user.name, email: user.email, token });
  }
}
