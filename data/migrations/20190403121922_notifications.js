exports.up = function(knex, Promise) {
  return knex.schema.createTable("notifications", tbl => {
    tbl.increments();
    tbl.boolean("unread").defaultTo(true);
    tbl
      .integer("recipient")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
    tbl.string("type", 255).notNullable();
    tbl
      .integer("entity_id")
      .unsigned()
      .notNullable();
    tbl.string("msg_body", 255).notNullable();
    tbl.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("notifications");
};
