import axios from 'axios';

import StormglassClient from '@src/clients/StormglassClient';
import HttpRequest, { Response as HttpResponse } from '@src/util/Request';

import stormGlassWeather3hoursNormalizedFixture from '@tests/fixtures/stormglass_normalized_response_3_hours.json';
import stormGlassWeather3hoursFixture from '@tests/fixtures/stormglass_weather_3_hours.json';

jest.mock('@src/util/Request');

describe('Storm Glass Client tests', () => {
  const MockedRequestClass = HttpRequest as jest.Mocked<typeof HttpRequest>;
  const mockedRequest = new HttpRequest() as jest.Mocked<HttpRequest>;

  it('should return the normalized forecast from the storm glass service', async () => {
    const lat = -23.65702;
    const lng = -46.613792;

    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3hoursFixture,
    } as HttpResponse);

    const stormglassClient = new StormglassClient(mockedRequest);
    const response = await stormglassClient.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassWeather3hoursNormalizedFixture);
  });

  it('should exclude the incomplete stormglass point', async () => {
    const lat = -23.65702;
    const lng = -46.613792;

    const incompleteResponse = {
      hours: [
        {
          swellDirection: {
            noaa: 64.26,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };

    mockedRequest.get.mockResolvedValue({
      data: incompleteResponse,
    } as HttpResponse);

    const stormglassClient = new StormglassClient(mockedRequest);
    const response = await stormglassClient.fetchPoints(lat, lng);
    expect(response).toEqual([]);
  });

  it('should get a generic error from Stormglass service when the request failt before reaching the service', async () => {
    const lat = -23.65702;
    const lng = -46.613792;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

    const stormglassClient = new StormglassClient(mockedRequest);
    await expect(stormglassClient.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to comunicate with stormglass service: Network Error',
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    MockedRequestClass.isRequestError.mockReturnValue(true);
    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormglassClient(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the Stormglass service: Error: {"errors":["Rate Limit reached"]} Code: 429',
    );
  });
});
