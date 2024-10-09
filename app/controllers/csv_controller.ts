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

    const fileKey = `csv/${cuid()}.${file.extname}`
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

  async show({ params, response }: HttpContext) {
    const csv = await Csv.find(params.id)
    if (!csv) {
      return response.notFound({
        success: false,
        message: 'CSV not found!!',
        responseObject: null,
        statusCode: StatusCodes.NOT_FOUND,
      })
    }

    const products = await csv
      .related('products')
      .query()
      .preload('images', (q) => q.whereNotNull('error'))

    const errors: any[] = []

    for (const product of products) {
      for (const img of product.images) {
        errors.push({
          productName: product.name,
          serialNumber: product.serialNumber,
          error: img.error,
        })
      }
    }

    return response.ok({
      success: true,
      message: 'CSV Status retrieved.',
      responseObject: {
        id: csv.id,
        status: csv.status,
        report: {
          message: csv.error || '',
          data: errors,
        },
      },
      statusCode: StatusCodes.OK,
    })
  }

  async output({ params, response }: HttpContext) {
    const csv = await Csv.find(params.id)
    if (!csv) {
      return response.notFound({
        success: false,
        message: 'CSV not found!!',
        responseObject: null,
        statusCode: StatusCodes.NOT_FOUND,
      })
    }
    const products = await csv.related('products').query().preload('images')

    const csvHeader = 'Serial Number,Product Name,Input Image Urls,Output Image Urls'
    let rows = csvHeader + '\n'

    for (const product of products) {
      const serialNumber = product.serialNumber || ''
      const productName = product.name || ''
      const inputImageUrls = product.images.map((im) => im.inputUrl).join(',')
      const outputImageUrls = product.images.map((im) => im.outputUrl?.toString()).join(',')

      rows += `${serialNumber},${productName},"${inputImageUrls}","${outputImageUrls}"\n`
    }

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', `attachment; filename="csv_output_${csv.id}.csv"`)

    return response.send(rows)
  }
}
