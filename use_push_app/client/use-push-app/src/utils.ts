export class Utils {
  static wait = async (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

  /**
   * check data received from server is not null
   * @param data
   */
  static checkDataExist<T>(data: T | null): T {
    if (!data) {
      throw new Error("Unexpected nullish data");
    }
    return data;
  }
}