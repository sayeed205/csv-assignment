import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import { BaseJob } from 'adonis-resque'
import { parse } from 'csv-parse/sync'
import { DateTime } from 'luxon'
import sharp from 'sharp'

import { CsvStatus } from '#enums/csv'
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
            const resCheck = await fetch(importImg, { method: 'HEAD' })

            if (resCheck.ok) {
              const input = await fetch(importImg).then((res) => res.arrayBuffer())
              const resizedImage = await sharp(input)
                .metadata()
                .then(({ width }) =>
                  sharp(Buffer.from(input))
                    .resize(Math.round(width! * 0.5))
                    .toBuffer()
                )

              const fileKey = `products/images/${cuid()}.jpg`
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
            console.error(`Error processing image ${importImg}:`, error)
            csv.status = CsvStatus.ERROR
            csv.error = 'Error occurred while processing images'
            await csv.save()
            await product.related('images').create({
              inputUrl: importImg,
              error: JSON.stringify(error),
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
    csv.processedAt = DateTime.now()

    await csv.save()
  }
}
