const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('event_types', (table) => {
      table.increments('id');
      table.text('name').notNullable();
      table.integer('game_id').unsigned();
      table.integer('branch_id').unsigned();
      table.integer('division_id').unsigned();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));

      table.foreign('game_id').references('games.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
      table.foreign('branch_id').references('branches.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
      table.foreign('division_id').references('divisions.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON event_types
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
};

exports.down = (knex) => {
  return knex.schema.dropTable('event_types');
};
