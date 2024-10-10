import drive from '@adonisjs/drive/services/main'
import { afterDelete, BaseModel, beforeCreate, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import { CsvStatus } from '#enums/csv'
import Product from '#models/product'
import Webhook from '#models/webhook'

export default class Csv extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare file: string

  @column()
  declare status: CsvStatus

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
    await drive.use().delete(new URL(csv.file).pathname.replace(/^\/uploads/, ''))
  }

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>

  @hasOne(() => Webhook)
  declare webhook: HasOne<typeof Webhook>
}
