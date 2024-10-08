import { MultipartFile } from '@adonisjs/core/types/bodyparser'
import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import * as fs from 'node:fs'

const validateCSV = vine.createRule((value: unknown, _options: unknown, field: FieldContext) => {
  const file = value as MultipartFile
  const data = fs.readFileSync(file.tmpPath!, 'utf8')

  const header = data
    .toString()
    .split('\n')[0]
    .split(',')
    .filter((item) => !!item.trim())

  if (header.length !== 3) {
    field.report('Invalid CSV format', 'csv', field)
  }

  header.every((key) => {
    if (!['S. No.', 'Product Name', 'Input Image Urls'].includes(key)) {
      field.report('Invalid CSV Column', 'csv', field)
    }
  })
})

export const csvValidator = vine.compile(
  vine.object({
    file: vine
      .file({
        extnames: ['csv'],
      })
      .use(validateCSV({})),
  })
)
