exports.up = (knex) => {
  return knex.schema
    .createTable('operation_division', (table) => {
      table.integer('operation_id').unsigned().notNullable();
      table.integer('division_id').unsigned().notNullable();

      table.unique(['operation_id', 'division_id']);

      table.foreign('operation_id').references('operations.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
      table.foreign('division_id').references('divisions.id')
        .onDelete('CASCADE').onUpdate('CASCADE');
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('operation_division');
};
