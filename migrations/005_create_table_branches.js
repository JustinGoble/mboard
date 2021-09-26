const { stripIndent } = require('common-tags');

exports.up = (knex) => {
  return knex.schema
    .createTable('branches', (table) => {
      table.increments('id');
      table.text('name').notNullable();
      table.text('description');
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
    })
    .raw(stripIndent`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON branches
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `)
    .alterTable('operations', (table) => {
      table.integer('branch_id').unsigned();
      table.foreign('branch_id').references('branches.id')
        .onDelete('SET NULL').onUpdate('CASCADE');
    })
    .alterTable('users', (table) => {
      table.integer('branch_id').unsigned();
      table.foreign('branch_id').references('branches.id')
        .onDelete('SET NULL').onUpdate('CASCADE');
    });
};

exports.down = (knex) => {
  return knex.schema
    .alterTable('users', (table) => {
      table.dropColumn('branch_id');
    })
    .alterTable('operations', (table) => {
      table.dropColumn('branch_id');
    })
    .dropTable('branches');
};
