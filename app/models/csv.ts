import drive from '@adonisjs/drive/services/main'
import { afterDelete, BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import { CsvStatus } from '#enums/csv'
import Product from '#models/product'

export default class Csv extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare file: string

  @column()
  declare status: CsvStatus

  @column()
  declare webhookUrl: string | null

  @column()
  declare error: string | null

  @column()
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async beforeCreateHook(csv: Csv) {
    csv.id = csv.id || randomUUID()
  }

  @afterDelete()
  static async afterDeleteHook(csv: Csv) {
    await drive.use().delete(csv.file)
  }

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>
}
