const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id');
      table.text('name').notNullable();
      table.text('description');
      table.text('discord_id').notNullable();
      table.text('permissions');
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
      table.enu('state', ['active', 'inactive'])
        .notNullable().defaultTo('active');
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `)
    .alterTable('operations', (table) => {
      table.integer('leader_id').unsigned();
      table.foreign('leader_id').references('users.id')
        .onDelete('RESTRICT').onUpdate('CASCADE');
    })
    .alterTable('op_assignments', (table) => {
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id')
        .onDelete('RESTRICT').onUpdate('CASCADE');
    });
};

exports.down = (knex) => {
  return knex.schema
    .alterTable('operations', (table) => {
      table.dropColumn('leader_id');
    })
    .alterTable('op_assignments', (table) => {
      table.dropColumn('user_id');
    })
    .dropTable('users');
};
