export class ACIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthenticationError extends ACIError {}
export class PermissionError extends ACIError {}
export class NotFoundError extends ACIError {}
export class ValidationError extends ACIError {}
export class RateLimitError extends ACIError {}
export class ServerError extends ACIError {}
export class UnknownError extends ACIError {} 