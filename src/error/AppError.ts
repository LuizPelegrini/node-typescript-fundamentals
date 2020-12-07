/**
 * Application Error class that wraps an HTTP errorCode and a message
 */

export default class AppError {
  public readonly message: string;

  public readonly statusCode: number;

  constructor(message: string, status = 400) {
    this.statusCode = status;
    this.message = message;
  }
}
