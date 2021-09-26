const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('divisions', (table) => {
      table.increments('id');
      table.integer('branch_id').unsigned().notNullable();
      table.text('name').notNullable();
      table.text('description');
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));

      table.foreign('branch_id').references('branches.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON divisions
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
};

exports.down = (knex) => {
  return knex.schema.dropTable('divisions');
};
