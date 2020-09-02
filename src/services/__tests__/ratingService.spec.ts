import { Beach, Position } from '../ForecastService';
import RatingService from '../RatingService';

describe('Rating service tests', () => {
  const defaultBeach: Beach = {
    lat: -33.792726,
    lng: 151.289824,
    name: 'Manly',
    position: Position.E,
    user: 'some-user',
  };

  const defaultRating = new RatingService(defaultBeach);

  describe('Calculate rating for a given point', () => {
    const defaultPoint = {
      swellDirection: 110,
      swellHeight: 0.1,
      swellPeriod: 5,
      time: 'test',
      waveDirection: 110,
      waveHeight: 0.1,
      windDirection: 100,
      windSpeed: 100,
    };

    it('should get a rating less than 1 for a poor point', () => {
      const rating = defaultRating.getRatingForAPoint(defaultPoint);
      expect(rating).toBe(1);
    });

    it('should get a rating of 1 for an ok point', () => {
      const pointData = {
        swellHeight: 0.4,
      };

      const point = { ...defaultPoint, ...pointData };

      const rating = defaultRating.getRatingForAPoint(point);
      expect(rating).toBe(1);
    });

    it('should get a rating of 3 for a point with offshore winds and a half overhead height', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.7,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForAPoint(point);
      expect(rating).toBe(3);
    });

    it('should get a rating of 4 for a point with offshore winds, half overhead high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.7,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForAPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 4 for a point with offshore winds, shoulder high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 1.5,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForAPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 5 classic day!', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForAPoint(point);
      expect(rating).toBe(5);
    });

    it('should get a rating of 4 a good condition but with crossshore winds', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 130,
        },
      };
      const rating = defaultRating.getRatingForAPoint(point);
      expect(rating).toBe(4);
    });
  });

  describe('get position based on points location', () => {
    it('should get the point based on east location', () => {
      const position = defaultRating.getPositionFromLocation(92);
      expect(position).toEqual(Position.E);
    });

    it('should get the point based on north location', () => {
      const position = defaultRating.getPositionFromLocation(360);
      expect(position).toEqual(Position.N);
    });

    it('should get the point based on south location', () => {
      const position = defaultRating.getPositionFromLocation(200);
      expect(position).toEqual(Position.S);
    });

    it('should get the point based on west location', () => {
      const position = defaultRating.getPositionFromLocation(300);
      expect(position).toEqual(Position.W);
    });
  });

  describe('get rating based on swell height', () => {
    it('should get rating 1 when for less than ankle to knee high swell', () => {
      const rating = defaultRating.getRatingBasedOnSwellSize(0.2);
      expect(rating).toBe(1);
    });

    it('should get rating 2 when for less than ankle to knee swell', () => {
      const rating = defaultRating.getRatingBasedOnSwellSize(0.6);
      expect(rating).toBe(2);
    });

    it('should get rating 3 when for waist high swell', () => {
      const rating = defaultRating.getRatingBasedOnSwellSize(1.5);
      expect(rating).toBe(3);
    });

    it('should get rating 5 when for overhead swell', () => {
      const rating = defaultRating.getRatingBasedOnSwellSize(2.5);
      expect(rating).toBe(5);
    });
  });

  describe('get rating based on swell period', () => {
    it('should get rating 1 a swell period of 5 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(5);
      expect(rating).toBe(1);
    });

    it('should get rating 2 a swell period of 9 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(9);
      expect(rating).toBe(2);
    });

    it('should get rating 4 a swell period of 12 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(12);
      expect(rating).toBe(4);
    });

    it('should get rating 5 a swell period of 16 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(16);
      expect(rating).toBe(5);
    });
  });

  describe('get rating based on wind and wave position', () => {
    it('should get rating 1 for a beach with onshore winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        Position.E,
        Position.E,
      );
      expect(rating).toBe(1);
    });

    it('should get rating 3 for a beach with cross winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        Position.E,
        Position.S,
      );
      expect(rating).toBe(3);
    });

    it('should get rating 5 for a beach with offshore winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        Position.E,
        Position.W,
      );
      expect(rating).toBe(5);
    });
  });
});
