const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('events', (table) => {
      table.increments('id');
      table.integer('creator_id').unsigned().notNullable();
      table.text('image_url');
      table.integer('event_type_id').unsigned().notNullable();
      table.text('g_calendar_id').notNullable();
      table.text('g_event_id').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));

      table.foreign('creator_id').references('users.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
      table.foreign('event_type_id').references('event_types.id')
        .onDelete('CASCADE').onUpdate('CASCADE');

      // No two database events should refer to the same Google event
      table.unique(['g_calendar_id', 'g_event_id']);
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON events
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
};

exports.down = (knex) => {
  return knex.schema.dropTable('events');
};
