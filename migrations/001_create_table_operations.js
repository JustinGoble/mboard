const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('operations', (table) => {
      table.increments('id');
      table.text('name').notNullable();
      table.text('description');
      table.text('requirements');
      table.text('location');
      table.enu('state', ['archived', 'in_progress', 'unapproved', 'draft'])
        .notNullable().defaultTo('unapproved');
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('target_date');
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON operations
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
};

exports.down = (knex) => {
  return knex.schema.dropTable('operations');
};
