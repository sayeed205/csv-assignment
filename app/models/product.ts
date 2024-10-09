import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import Csv from '#models/csv'

export default class Product extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare serialNumber: BigInt

  @column()
  declare name: string

  @column()
  declare importUrls: string[]

  @column()
  declare outputUrls: string[] | null

  @column()
  declare csvId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async beforeCreateHook(product: Product) {
    product.id = product.id || randomUUID()
  }

  @belongsTo(() => Csv)
  declare csv: BelongsTo<typeof Csv>
}
