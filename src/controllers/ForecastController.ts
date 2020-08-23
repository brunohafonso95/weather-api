import { Controller, Get, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import authMiddleware from '@src/middlewares/authMiddleware';
import BeachModel from '@src/models/Beach';
import ForecastService from '@src/services/ForecastService';

const forecastService = new ForecastService();

@Controller('api/v1/forecast')
@ClassMiddleware(authMiddleware)
export default class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const beaches = await BeachModel.find({ user: req.decoded?.id });
      const forecastData = await forecastService.processForecastForBeaches(
        beaches,
      );

      res.json(forecastData);
    } catch (error) {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal Server Error' });
    }
  }
}
