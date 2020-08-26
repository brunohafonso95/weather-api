import httpStatus from 'http-status-codes';
import nock from 'nock';

import BeachModel from '@src/models/Beach';
import UserModel from '@src/models/User';
import AuthService from '@src/services/AuthService';

import apiForecastResponseFixture from '@tests/fixtures/api_forecast_response.json';
import stormGlassWeather3hoursFixture from '@tests/fixtures/stormglass_weather_3_hours.json';

describe('Beach Forecast Functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@mail.com',
    password: '1234',
  };

  let token: string;

  beforeEach(async () => {
    await BeachModel.deleteMany({});
    await UserModel.deleteMany({});
    const newUser = await new UserModel(defaultUser).save();
    token = AuthService.generateToken(newUser.toJSON());
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Ubatuba',
      position: 'E',
      user: newUser.id,
    };

    const beach = new BeachModel(defaultBeach);
    await beach.save();
  });

  afterAll(async () => {
    await BeachModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
      })
      .reply(200, stormGlassWeather3hoursFixture);
    const { body, status } = await global.testRequest
      .get('/api/v1/forecast')
      .set('x-access-token', token);
    expect(status).toBe(httpStatus.OK);
    expect(body).toEqual(apiForecastResponseFixture);
  });

  it('should return internal server when something went wrong during the process', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
      })
      .replyWithError('something went wrong');
    const { body, status } = await global.testRequest
      .get('/api/v1/forecast')
      .set('x-access-token', token);
    expect(status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(body).toEqual({
      code: httpStatus.INTERNAL_SERVER_ERROR,
      error: httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
      message: 'Something went wrong',
    });
  });
});
