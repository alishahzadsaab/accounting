import esaint from 'esaint';

export default async function execute() {
  // Since sqlite has no ALTER TABLE to change column meta
  // the table has to be _Prestiged_.
  const tableInfo = await esaint.db.sql('pragma table_info("Payment")');
  const referenceId = tableInfo.find(({ name }) => name === 'referenceId');
  if (!referenceId || !referenceId.notnull) {
    return;
  }

  await esaint.db.createTable('Payment', '__Payment');
  await esaint.db.sql('insert into __Payment select * from Payment');

  const mainCount = await esaint.db.knex
    .table('Payment')
    .count('name as count');
  const replCount = await esaint.db.knex
    .table('__Payment')
    .count('name as count');

  if (mainCount[0].count === replCount[0].count) {
    await esaint.db.knex.schema.dropTable('Payment');
    await esaint.db.knex.schema.renameTable('__Payment', 'Payment');
  } else {
    await esaint.db.knex.schema.dropTable('__Payment');
  }
}
