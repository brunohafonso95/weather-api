import config from 'config';

import InternalError from '@src/util/errors/InternalError';
import HttpRequest from '@src/util/Request';
import TimeUtil from '@src/util/Time';

import IStormglassConfig from '../interfaces/IStormglassConfig';

export interface StormglassForecastPointSource {
  [key: string]: number;
}

export interface StormglassForecastPoint {
  readonly time: string;
  readonly swellDirection: StormglassForecastPointSource;
  readonly swellHeight: StormglassForecastPointSource;
  readonly swellPeriod: StormglassForecastPointSource;
  readonly waveDirection: StormglassForecastPointSource;
  readonly waveHeight: StormglassForecastPointSource;
  readonly windDirection: StormglassForecastPointSource;
  readonly windSpeed: StormglassForecastPointSource;
}

export interface StormglassForecastResponse {
  readonly hours: StormglassForecastPoint[];
  readonly meta: {
    cost: number;
    dailyQuota: number;
    end: string;
    lat: number;
    lng: number;
    params: string[];
    requestCount: number;
    source: string[];
    start: string;
  };
}

export interface ForecastPoint {
  time: string;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  waveDirection: number;
  waveHeight: number;
  windDirection: number;
  windSpeed: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to comunicate with stormglass service';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormglassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the Stormglass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormglassResourceConfig: IStormglassConfig = config.get<
  IStormglassConfig
>('App.resources.Stormglass');

export default class StormglassClient {
  readonly stormglassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

  readonly stormglassAPISource = 'noaa';

  constructor(protected request = new HttpRequest()) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const endTimestamp = TimeUtil.getUnixTimestampFutureDay(1);
      const response = await this.request.get<StormglassForecastResponse>(
        `${stormglassResourceConfig.apiUrl}/weather/point?lat=${lat}&lng=${lng}&params=${this.stormglassAPIParams}&source=${this.stormglassAPISource}&end=${endTimestamp}`,
        {
          headers: {
            Authorization: stormglassResourceConfig.apiToken,
          },
        },
      );

      return this.normalizeStormglassForecastResponse(response.data);
    } catch (error) {
      if (HttpRequest.isRequestError(error)) {
        throw new StormglassResponseError(
          `Error: ${JSON.stringify(error.response.data)} Code: ${
            error.response.status
          }`,
        );
      }

      throw new ClientRequestError(error.message);
    }
  }

  private normalizeStormglassForecastResponse(
    stormglassResponse: StormglassForecastResponse,
  ): ForecastPoint[] {
    return stormglassResponse.hours
      .filter(this.isStormglassForecastPointValid.bind(this))
      .map(point => ({
        time: point.time,
        swellDirection: point.swellDirection[this.stormglassAPISource],
        swellHeight: point.swellHeight[this.stormglassAPISource],
        swellPeriod: point.swellPeriod[this.stormglassAPISource],
        waveDirection: point.waveDirection[this.stormglassAPISource],
        waveHeight: point.waveHeight[this.stormglassAPISource],
        windDirection: point.windDirection[this.stormglassAPISource],
        windSpeed: point.windSpeed[this.stormglassAPISource],
      }));
  }

  private isStormglassForecastPointValid(
    point: Partial<StormglassForecastPoint>,
  ): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormglassAPISource] &&
      point.swellHeight?.[this.stormglassAPISource] &&
      point.swellPeriod?.[this.stormglassAPISource] &&
      point.waveDirection?.[this.stormglassAPISource] &&
      point.waveHeight?.[this.stormglassAPISource] &&
      point.swellDirection?.[this.stormglassAPISource] &&
      point.windSpeed?.[this.stormglassAPISource]
    );
  }
}
