import drive from '@adonisjs/drive/services/main'
import * as csvUtils from '@fast-csv/parse'
import { BaseJob } from 'adonis-resque'

import Csv from '#models/csv'
import Product from '#models/product'
import logger from '@adonisjs/core/services/logger'

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
    const csvData = await drive.use().get(csv.file)

    csvUtils
      .parseString<CSV, CSV>(csvData, { headers: true })
      .on('error', (error) => logger.error(error))
      .on('data', async (row: CSV) => {
        const product = await Product.create({
          serialNumber: BigInt(row['S. No.']),
          name: row['Product Name'],
          importUrls: row['Input Image Urls'].split(','),
        })
      })
      .on('end', (rowCount: number) => logger.info(`Parsed ${rowCount} rows`))
  }
}
