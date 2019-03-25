exports.up = function (knex, Promise) {
  return knex.schema.createTable("usersV2", tbl => {
    tbl.increments();
    tbl.string("name");
    tbl.string("email");
    tbl.string("image_url");
    tbl.string("nickname");
    tbl.string("sub");
    tbl.string("acct_type");
    tbl.string("phone");



  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists("usersV2");
};