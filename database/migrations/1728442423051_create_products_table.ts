import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.bigInteger('serial_number').notNullable()
      table.text('name').notNullable()
      table.specificType('import_urls', 'TEXT[]').notNullable()
      table.specificType('output_urls', 'TEXT[]').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
