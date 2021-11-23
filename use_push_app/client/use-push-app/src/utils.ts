export class Utils {
  static wait = async (delay: number) => new Promise(resolve => setTimeout(resolve, delay));
}