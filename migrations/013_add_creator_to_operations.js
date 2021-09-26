exports.up = async (knex) => {
  // Get the first user. This is the default owner of all operations.
  const [user] = await knex('users')
    .select('*')
    .orderBy('id', 'asc')
    .limit(1);

  // Add the creator_id field, but keep it nullable
  await knex.schema.alterTable('operations', (table) => {
    table.integer('creator_id').unsigned();
    table.foreign('creator_id').references('users.id')
      .onDelete('RESTRICT').onUpdate('CASCADE');
  });

  const BATCH_SIZE = 100;
  let page = 0;
  let operations = [];

  do {
    // Get operations BATCH_SIZE at a time
    operations = await knex('operations')
      .select('*')
      .orderBy('id', 'asc')
      .limit(BATCH_SIZE)
      .offset(page * BATCH_SIZE);

    for (const operation of operations) {
      if (operation.leader_id) {
        // Operations has a leader, set the leader as its creator
        await knex('operations')
          .where('id', operation.id)
          .update({ creator_id: operation.leader_id });
      } else if (user) {
        // No leader, use the default user as the creator
        await knex('operations')
          .where('id', operation.id)
          .update({ creator_id: user.id });
      } else {
        // No leader and no users in the database, remove the operation
        await knex('operations')
          .where('id', operation.id)
          .delete();
      }
    }

    page += 1;
  } while (operations.length > 0);

  // Make the creator_id operation field not nullable
  await knex.schema.alterTable('operations', (table) => {
    table.integer('creator_id').unsigned().notNullable().alter();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('operations', (table) => {
    table.dropColumn('creator_id');
  });
};
