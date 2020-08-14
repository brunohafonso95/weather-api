import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';

import StormglassClient from '@src/clients/StormglassClient';

@Controller('api/v1/forecast')
export default class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { lat = 1, lng = 2 } = req.query;
    const stormglassClient = new StormglassClient();
    const forecastResponse = await stormglassClient.fetchPoints(
      Number(lat),
      Number(lng),
    );
    res.json(forecastResponse);
  }
}
