import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import { parse } from 'csv-parse/sync'
import * as fs from 'node:fs'

import { CsvStatus } from '#enums/csv'
import Csv from '#models/csv'
import { csvValidator } from '#validators/csv'
import { StatusCodes } from 'http-status-codes'

export default class CSVController {
  async import({ request, response }: HttpContext) {
    const { file } = await request.validateUsing(csvValidator)

    // use adonis-drive s3/file system
    await file.move('uploads/csv', {
      name: `${cuid()}.${file.extname}`,
    })

    const csv = await Csv.create({
      file: file.filePath!,
      status: CsvStatus.PENDING,
    })

    const data = fs.readFileSync(file.filePath!, 'utf8')

    const rows = data.toString()

    const rowData = parse(rows, {
      columns: true,
    })

    return response.json({
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
