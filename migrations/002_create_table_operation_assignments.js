const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('op_assignments', (table) => {
      table.increments('id');
      table.integer('operation_id').unsigned().notNullable();
      table.text('name').notNullable();
      table.text('description');
      table.boolean('accepted').notNullable().defaultTo(false);
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));

      table.foreign('operation_id').references('operations.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON op_assignments
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
};

exports.down = (knex) => {
  return knex.schema.dropTable('op_assignments');
};
