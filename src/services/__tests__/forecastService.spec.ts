import StormglassClient from '@src/clients/StormglassClient';
import ForecastService, {
  BeachPosition,
  Beach,
} from '@src/services/ForecastService';

import stormGlassWeather3hoursNormalizedFixture from '@tests/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('@src/clients/StormglassClient');

describe('Forecast Service tests', () => {
  const mockedStormglassClient = new StormglassClient() as jest.Mocked<
    StormglassClient
  >;

  it('should return the forecast for a list of beaches', async () => {
    mockedStormglassClient.fetchPoints.mockResolvedValue(
      stormGlassWeather3hoursNormalizedFixture,
    );

    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'some-id',
      },
    ];

    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 3.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 0.47,
            windDirection: 299.45,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T01:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T01:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T02:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 182.56,
            swellHeight: 0.28,
            swellPeriod: 3.44,
            time: '2020-04-26T02:00:00+00:00',
            waveDirection: 232.86,
            waveHeight: 0.46,
            windDirection: 321.5,
            windSpeed: 100,
          },
        ],
      },
    ];

    const forecastService = new ForecastService(mockedStormglassClient);
    const beachesWithRating = await forecastService.processForecastForBeaches(
      beaches,
    );
    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('should return a empty list when the array os beaches is empty', async () => {
    const forecastService = new ForecastService();
    const beachesWithRating = await forecastService.processForecastForBeaches(
      [],
    );
    expect(beachesWithRating).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong during the rating process', async () => {
    const beaches = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'some-id',
      },
    ];

    mockedStormglassClient.fetchPoints.mockRejectedValue({
      message: 'Error fetching data',
    });
    const forecastService = new ForecastService(mockedStormglassClient);
    await expect(
      forecastService.processForecastForBeaches(beaches),
    ).rejects.toThrow(
      'Unexpected error during the forecast processing: Error fetching data',
    );
  });

  it('should throw internal processing error when the rate limit of stormglass service was reached', async () => {
    const beaches = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'some-id',
      },
    ];

    mockedStormglassClient.fetchPoints.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });
    const forecastService = new ForecastService(mockedStormglassClient);
    await expect(
      forecastService.processForecastForBeaches(beaches),
    ).rejects.toThrow(
      'Unexpected error during the forecast processing: Error: {"errors":["Rate Limit reached"]} Code: 429',
    );
  });
});
