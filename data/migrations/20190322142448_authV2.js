
exports.up = function (knex, Promise) {
  return knex.schema.createTable('usersV2', tbl => {
    tbl.increments();
    tbl.string('googleId');
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('usersV2');
};
