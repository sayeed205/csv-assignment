import { errors as authErrors } from '@adonisjs/auth'
import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { errors as vineErrors } from '@vinejs/vine'
import { StatusCodes } from 'http-status-codes'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      ctx.response.status(422).json({
        success: false,
        message: 'Validation failed!!',
        responseObject: error.messages,
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      })
      return
    }

    if (
      error instanceof authErrors.E_INVALID_CREDENTIALS ||
      error instanceof authErrors.E_UNAUTHORIZED_ACCESS
    ) {
      return ctx.response.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: error.getResponseMessage(error, ctx),
        responseObject: null,
        statusCode: StatusCodes.UNAUTHORIZED,
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
