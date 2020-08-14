import StormglassClient, { ForecastPoint } from '@src/clients/StormglassClient';
import InternalError from '@src/util/errors/internal-error';
import HttpRequest from '@src/util/Request';

export enum BeachPosition {
  E = 'E',
  N = 'N',
  S = 'S',
  W = 'W',
}

export interface Beach {
  lat: number;
  lng: number;
  name: string;
  position: BeachPosition;
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
  ) {}

  public async processForecastForBeaches(
    beaches: Beach[],
  ): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];
    try {
      const points: ForecastPoint[][] = await Promise.all(
        beaches.map(beach =>
          this.stormglassClient.fetchPoints(beach.lat, beach.lng),
        ),
      );

      points.forEach((point: ForecastPoint[], index: number) => {
        pointsWithCorrectSources.push(
          ...this.getEnrichedBeachesData(point, beaches[index]),
        );
      });

      return this.mapForecastByTime(pointsWithCorrectSources);
    } catch (error) {
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

  private getEnrichedBeachesData(
    points: ForecastPoint[],
    beach: Beach,
  ): BeachForecast[] {
    return points.map(point => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1,
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
