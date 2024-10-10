import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import { BaseJob } from 'adonis-resque'
import axios from 'axios'
import { parse } from 'csv-parse/sync'
import { DateTime } from 'luxon'
import sharp from 'sharp'

import { CsvStatus } from '#enums/csv'
import Csv from '#models/csv'
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
    const url = new URL(csv.file).pathname.replace(/^\/uploads/, '')
    const csvData = await drive.use().get(url)

    csv.status = CsvStatus.PROCESSING
    await csv.save()

    const rows = parse(csvData, {
      columns: true,
    }) as CSV[]

    csv.status = CsvStatus.COMPLETED
    for (const row of rows) {
      try {
        const product = await csv.related('products').create({
          serialNumber: row['S. No.'],
          name: row['Product Name'],
          urls: row['Input Image Urls'].split(','),
        })

        const importImages = product.urls

        for (const importImg of importImages) {
          if (!importImg) {
            await product.related('images').create({
              inputUrl: importImg,
              error: 'URL not provided',
            })
            continue
          }
          try {
            const resCheck = await axios.head(importImg)

            if (resCheck.status === 200) {
              const input = await axios
                .get(importImg, { responseType: 'arraybuffer' })
                .then((res) => res.data)
              const resizedImage = await sharp(input)
                .metadata()
                .then(({ width }) =>
                  sharp(Buffer.from(input))
                    .resize(Math.round(width! * 0.5))
                    .toBuffer()
                )

              const fileKey = `products/images/${cuid()}.jpeg`
              await drive.use().put(fileKey, resizedImage, {
                contentType: 'image/jpeg',
              })
              const savedImageUrl = await drive.use().getUrl(fileKey)
              await product.related('images').create({
                inputUrl: importImg,
                outputUrl: savedImageUrl,
              })
            } else {
              csv.status = CsvStatus.ERROR
              csv.error = 'Error occurred while processing images'
              await csv.save()
              await product.related('images').create({
                inputUrl: importImg,
                error: 'Invalid image url',
              })
            }
          } catch (error) {
            const err = error.response || error.errors ? error.errors.map(JSON.stringify) : error
            logger.error(`error processing image: ${importImg}, error: ${err}`)
            csv.status = CsvStatus.ERROR
            csv.error = 'Error occurred while processing images'
            await csv.save()
            await product.related('images').create({
              inputUrl: importImg,
              error: JSON.stringify(err),
            })
          }
        }
      } catch (error) {
        console.error(`Error processing row:`, error)
        csv.status = CsvStatus.ERROR
        csv.error = JSON.stringify(error)
        await csv.save()
      }
    }

    const webhook = await csv.related('webhook').query().first()
    if (webhook) {
      try {
        await axios.post(webhook.url, {
          status: csv.status,
          processedAt: csv.processedAt,
          error: csv.error,
        })
        webhook.processedAt = DateTime.now()
        logger.info(`Webhook processed ${webhook.url}`)
      } catch (error) {
        const err = error.response || error.errors ? error.errors.map(JSON.stringify) : error
        logger.error(`error while invoking webhook for url: ${webhook.url},error: ${err}`)
        webhook.error = `${err}`
      }
      await webhook.save()
    }

    csv.processedAt = DateTime.now()

    await csv.save()
  }
}
