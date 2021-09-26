const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('games', (table) => {
      table.increments('id');
      table.text('name').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON games
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
};

exports.down = (knex) => {
  return knex.schema.dropTable('games');
};
