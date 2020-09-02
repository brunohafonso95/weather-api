import StormglassClient, { ForecastPoint } from '@src/clients/StormglassClient';
import Logger from '@src/Logger';
import InternalError from '@src/util/errors/InternalError';
import orderByCustomProp from '@src/util/orderByCustomProp';
import HttpRequest from '@src/util/Request';

import Rating from './RatingService';

export enum Position {
  E = 'E',
  N = 'N',
  S = 'S',
  W = 'W',
}

export interface Beach {
  lat: number;
  lng: number;
  name: string;
  position: Position;
  user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {
  rating: number;
}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export default class ForecastService {
  constructor(
    protected stormglassClient: StormglassClient = new StormglassClient(),
    protected RatingService: typeof Rating = Rating,
  ) {}

  public async processForecastForBeaches(
    beaches: Beach[],
  ): Promise<TimeForecast[]> {
    try {
      const beachForecast = await this.calculateRating(beaches);
      const timeForecast = this.mapForecastByTime(beachForecast);
      return timeForecast.map(t => ({
        time: t.time,
        forecast: t.forecast.sort((curr, next) =>
          orderByCustomProp<Omit<BeachForecast, '_id'>>(curr, next, 'rating'),
        ),
      }));
    } catch (error) {
      Logger.error(error);
      if (HttpRequest.isRequestError(error)) {
        throw new ForecastProcessingInternalError(
          `Error: ${JSON.stringify(error.response.data)} Code: ${
            error.response.status
          }`,
        );
      }

      throw new ForecastProcessingInternalError(error.message);
    }
  }

  private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];
    Logger.info(`Preparing the forecast for ${beaches.length} beaches`);
    const points: ForecastPoint[][] = await Promise.all(
      beaches.map(beach =>
        this.stormglassClient.fetchPoints(beach.lat, beach.lng),
      ),
    );

    points.forEach((point: ForecastPoint[], index: number) => {
      const ratingService = new this.RatingService(beaches[index]);
      pointsWithCorrectSources.push(
        ...this.getEnrichedBeachesData(point, beaches[index], ratingService),
      );
    });

    return pointsWithCorrectSources;
  }

  private getEnrichedBeachesData(
    points: ForecastPoint[],
    beach: Beach,
    ratingService: Rating,
  ): BeachForecast[] {
    return points.map(point => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: ratingService.getRatingForAPoint(point),
      },
      ...point,
    }));
  }

  private mapForecastByTime(beachForecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];
    beachForecast.forEach(point => {
      const timePoint = forecastByTime.find(
        forecast => forecast.time === point.time,
      );

      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    });

    return forecastByTime;
  }
}
