import { Controller, Get, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import authMiddleware from '@src/middlewares/authMiddleware';
import BeachModel from '@src/models/Beach';
import ForecastService from '@src/services/ForecastService';

import BaseController from './BaseController';

const forecastService = new ForecastService();

@Controller('api/v1/forecast')
@ClassMiddleware(authMiddleware)
export default class ForecastController extends BaseController {
  /**
   * GET /forecast
   * @tag Beaches
   * @security apiKey
   * @summary Get the list of forecast.
   * @description Get the list of forecast ordered by the most ranked
   * @response 200 - The list of forecast has been returned
   * @responseContent {TimeForecast} 200.application/json
   * @response 401 - Unauthorized
   * @responseContent {AuthenticationError} 401.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
   */
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response,
  ): Promise<void> {
    const beaches = await BeachModel.find({ user: req.decoded?.id });
    const forecastData = await forecastService.processForecastForBeaches(
      beaches,
    );

    this.sendDefaulResponse(res, {
      code: httpStatus.OK,
      payload: forecastData,
    });
  }
}
