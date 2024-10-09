import logger from '@adonisjs/core/services/logger'
import drive from '@adonisjs/drive/services/main'
import * as csvUtils from '@fast-csv/parse'
import { BaseJob } from 'adonis-resque'

import ProcessImage from '#jobs/process_image'
import Csv from '#models/csv'

export interface ProcessCsvArgs {
  id: string
}

export interface CSV {
  'S. No.': string
  'Product Name': string
  'Input Image Urls': string
}

export default class ProcessCsv extends BaseJob {
  async perform({ id }: ProcessCsvArgs) {
    const csv = await Csv.findOrFail(id)
    const url = new URL(csv.file).pathname.replace(/^\/uploads/, '')
    const csvData = await drive.use().get(url)

    csvUtils
      .parseString<CSV, CSV>(csvData, { headers: true })
      .on('error', (error) => logger.error(error))
      .on('data', async (row: CSV) => {
        const product = await csv.related('products').create({
          serialNumber: BigInt(row['S. No.']),
          name: row['Product Name'],
          importUrls: row['Input Image Urls'].split(','),
        })

        await ProcessImage.enqueue({ id: product.id })
      })
      .on('end', (rowCount: number) => logger.info(`Parsed ${rowCount} rows`))
  }
}
