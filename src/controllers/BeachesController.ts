import { Controller, Post, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import authMiddleware from '@src/middlewares/authMiddleware';
import BeachModel from '@src/models/Beach';

import BaseController from './BaseController';

@Controller('api/v1/beaches')
@ClassMiddleware(authMiddleware)
export default class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new BeachModel({ ...req.body, user: req.decoded.id });
      const result = await beach.save();
      res.status(httpStatus.CREATED).json(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }
}
