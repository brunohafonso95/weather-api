import { Controller, Post, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import authMiddleware from '@src/middlewares/authMiddleware';
import BeachModel from '@src/models/Beach';

import BaseController from './BaseController';

@Controller('api/v1/beaches')
@ClassMiddleware(authMiddleware)
export default class BeachesController extends BaseController {
  /**
   * POST /beaches
   * @tag Beaches
   * @security apiKey
   * @summary Create a new Beach.
   * @description Create a new Beach belonging to the authenticated user
   * @bodyContent {Beach} application/json
   * @bodyRequired
   * @response 201 - The Beach has been created
   * @responseContent {BeachCreatedResponse} 201.application/json
   * @response 400 - Invalid parameters
   * @responseContent {Error} 400.application/json
   * @response 401 - Unauthorized
   * @responseContent {AuthenticationError} 401.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
   */
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    const beach = new BeachModel({ ...req.body, user: req.decoded?.id });
    const result = await beach.save();
    this.sendDefaulResponse(res, {
      code: httpStatus.CREATED,
      payload: result,
    });
  }
}
