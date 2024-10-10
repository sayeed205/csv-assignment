import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import Csv from '#models/csv'

export default class Webhook extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare url: string

  @column()
  declare error: string | null

  @column()
  declare processedAt: DateTime

  @column()
  declare csvId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async beforeCreateHook(webhook: Webhook) {
    webhook.id = webhook.id || randomUUID()
  }

  @belongsTo(() => Csv)
  declare csv: BelongsTo<typeof Csv>
}
