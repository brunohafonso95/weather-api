import { ForecastPoint } from '@src/clients/StormglassClient';
import { WAVE_HEIGHTS } from '@src/consts';

import { Beach, Position } from './ForecastService';

export default class RatingService {
  constructor(private beach: Beach) {}

  public getRatingForAPoint(point: ForecastPoint): number {
    const swellDirection = this.getPositionFromLocation(point.swellDirection);
    const windDirection = this.getPositionFromLocation(point.windDirection);
    const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
      swellDirection,
      windDirection,
    );
    const swellHeightRating = this.getRatingBasedOnSwellSize(point.swellHeight);
    const swellPeriodRating = this.getRatingBasedOnSwellPeriod(
      point.swellPeriod,
    );

    return Math.round(
      (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3,
    );
  }

  public getPositionFromLocation(coordinates: number): Position {
    if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0)) {
      return Position.N;
    }
    if (coordinates >= 50 && coordinates < 120) {
      return Position.E;
    }
    if (coordinates >= 120 && coordinates < 220) {
      return Position.S;
    }
    if (coordinates >= 220 && coordinates < 310) {
      return Position.W;
    }
    return Position.E;
  }

  public getRatingBasedOnSwellSize(height: number): number {
    if (
      height >= WAVE_HEIGHTS.ankleToKnee.min &&
      height < WAVE_HEIGHTS.ankleToKnee.max
    ) {
      return 2;
    }

    if (
      height >= WAVE_HEIGHTS.waistHigh.min &&
      height < WAVE_HEIGHTS.waistHigh.max
    ) {
      return 3;
    }

    if (height >= WAVE_HEIGHTS.headHigh.min) {
      return 5;
    }

    return 1;
  }

  public getRatingBasedOnSwellPeriod(period: number): number {
    if (period >= 7 && period < 10) {
      return 2;
    }

    if (period >= 10 && period < 14) {
      return 4;
    }

    if (period >= 14) {
      return 5;
    }

    return 1;
  }

  public getRatingBasedOnWindAndWavePositions(
    wavePosition: Position,
    windPosition: Position,
  ): number {
    if (wavePosition === windPosition) {
      return 1;
    }

    if (this.isWindOffshore(wavePosition, windPosition)) {
      return 5;
    }

    return 3;
  }

  private isWindOffshore(
    wavePosition: Position,
    windPosition: Position,
  ): boolean {
    const windOffshoreConditions = [
      () =>
        wavePosition === Position.N &&
        windPosition === Position.S &&
        this.beach.position === Position.N,
      () =>
        wavePosition === Position.S &&
        windPosition === Position.N &&
        this.beach.position === Position.S,
      () =>
        wavePosition === Position.E &&
        windPosition === Position.W &&
        this.beach.position === Position.E,
      () =>
        wavePosition === Position.W &&
        windPosition === Position.E &&
        this.beach.position === Position.W,
    ];

    return windOffshoreConditions.some(condition => condition());
  }
}
