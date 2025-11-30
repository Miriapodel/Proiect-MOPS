export class AppError extends Error {
    code: string;
    status: number;
    details?: unknown;

    constructor(code: string, message: string, status: number, details?: unknown) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

export function badRequest(message = "Bad request", details?: unknown) {
    return new AppError("BAD_REQUEST", message, 400, details);
}
export function unauthorized(message = "Unauthorized", details?: unknown) {
    return new AppError("UNAUTHORIZED", message, 401, details);
}
export function forbidden(message = "Forbidden", details?: unknown) {
    return new AppError("FORBIDDEN", message, 403, details);
}
export function notFound(message = "Not found", details?: unknown) {
    return new AppError("NOT_FOUND", message, 404, details);
}
export function conflict(message = "Conflict", details?: unknown) {
    return new AppError("CONFLICT", message, 409, details);
}
export function validationError(message = "Validation error", details?: unknown) {
    return new AppError("VALIDATION_ERROR", message, 422, details);
}
export function internalError(message = "Internal error", details?: unknown) {
    return new AppError("INTERNAL_ERROR", message, 500, details);
}

export function isAppError(err: unknown): err is AppError {
    return err instanceof AppError;
}
