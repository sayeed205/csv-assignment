import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'crypto'
import { DateTime } from 'luxon'

import Product from '#models/product'

export default class Image extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare inputUrl: string

  @column()
  declare outputUrl: string | null

  @column()
  declare error: string | null

  @column()
  declare productId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async beforeCreateHook(image: Image) {
    image.id = image.id || randomUUID()
  }

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
