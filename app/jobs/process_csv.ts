import drive from '@adonisjs/drive/services/main'
import * as csvUtils from '@fast-csv/parse'
import { BaseJob } from 'adonis-resque'

import Csv from '#models/csv'
import logger from '@adonisjs/core/services/logger'

export interface ProcessCsvArgs {
  id: string
}

export default class ProcessCsv extends BaseJob {
  async perform({ id }: ProcessCsvArgs) {
    const csv = await Csv.findOrFail(id)
    const csvData = await drive.use().get(csv.file)

    csvUtils
      .parseString(csvData, { headers: true })
      .on('error', (error) => logger.error(error))
      .on('data', (row) => console.log(row))
      .on('end', (rowCount: number) => logger.info(`Parsed ${rowCount} rows`))
  }
}
