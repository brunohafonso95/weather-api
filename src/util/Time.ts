import moment from 'moment';

export default class TimeUtil {
  public static getUnixTimestampFutureDay(days: number): number {
    return moment().add(days, 'days').unix();
  }
}
