import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.text('serial_number').notNullable()
      table.text('name').notNullable()
      table.specificType('urls', 'TEXT[]').notNullable()
      table.uuid('csv_id').references('csvs.id').onDelete('CASCADE').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
