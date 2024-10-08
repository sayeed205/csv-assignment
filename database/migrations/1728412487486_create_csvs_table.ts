import { CsvStatus } from '#enums/csv'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'csvs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.text('file').notNullable()
      table
        .enum('status', Object.values(CsvStatus), {
          useNative: false,
          enumName: 'csv_status',
          schemaName: 'public',
        })
        .defaultTo(CsvStatus.PENDING)
        .notNullable()
      table.text('error').nullable()
      table.timestamp('processed_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
