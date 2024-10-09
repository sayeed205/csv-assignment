import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import { StatusCodes } from 'http-status-codes'

import { CsvStatus } from '#enums/csv'
import ProcessCsv from '#jobs/process_csv'
import Csv from '#models/csv'
import { csvValidator } from '#validators/csv'

export default class CSVController {
  async import({ request, response }: HttpContext) {
    const { file, webhookUrl } = await request.validateUsing(csvValidator)

    const fileKey = `uploads/csv/${cuid()}.${file.extname}`
    await file.moveToDisk(fileKey)
    const fileUrl = await drive.use().getUrl(fileKey)

    const csv = await Csv.create({
      file: fileUrl,
      status: CsvStatus.PENDING,
      webhookUrl: webhookUrl,
    })

    await ProcessCsv.enqueue({ id: csv.id })

    // todo)) make separate webhook table and service

    return response.created({
      success: true,
      message: 'CSV imported successfully',
      responseObject: {
        id: csv.id,
        status: csv.status,
      },
      statusCode: StatusCodes.CREATED,
    })
  }
}
