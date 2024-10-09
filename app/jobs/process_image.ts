import { CsvStatus } from '#enums/csv'
import Product from '#models/product'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import { BaseJob } from 'adonis-resque'
import { DateTime } from 'luxon'
import sharp from 'sharp'

export interface ProcessImageArgs {
  id: string
}

export default class ProcessImage extends BaseJob {
  async perform({ id }: ProcessImageArgs) {
    const product = await Product.findOrFail(id)

    const csv = await product.related('csv').query().firstOrFail()
    csv.status = CsvStatus.PROCESSING
    await csv.save()

    const importImages = product.importUrls
    const outputUrls: string[] = []

    for (const importImg of importImages) {
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
          outputUrls.push(savedImageUrl)
        } else {
          console.log(`TODO)): Handle invalid image URL: ${importImg}`)
          outputUrls.push('')
        }
      } catch (error) {
        console.error(`Error processing image ${importImg}:`, error)
      }
    }

    await product.merge({ outputUrls }).save()

    csv.processedAt = DateTime.now()
    csv.status = CsvStatus.COMPLETED

    await csv.save()
    // todo)) handle webhooks
  }
}
