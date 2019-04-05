exports.up = function(knex, Promise) {
  return knex.schema.createTable("analytics", tbl => {
    tbl.increments();
    tbl.unique(["action", "ip"]);
    tbl.string("action").nullable();
    tbl.string("ip").nullable();
    tbl.string("browser").nullable();
    tbl.string("referrer").nullable();
    tbl.string("country").nullable();
    tbl.string("region").nullable();
    tbl.string("city").nullable();
    tbl.string("postal").nullable();
    tbl.string("latitude").nullable();
    tbl.string("longitude").nullable();
    tbl
      .integer("agreement_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("agreements")
      .onDelete("SET NULL");

    tbl.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("analytics");
};
