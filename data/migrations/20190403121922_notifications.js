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
    tbl.string("type").notNullable();
    tbl
      .integer("entity_id")
      .unsigned()
      .notNullable()
    tbl.timestamps(true, true);
  })
  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("notifications")
};