exports.up = function(knex, Promise) {
  return knex.schema.createTable("ads", tbl => {
    tbl.increments();
    tbl.string("name").nullable();
    tbl.string("destination_url").nullable();
    tbl.boolean("active").defaultTo(true);
    tbl.string("size").notNullable();
    tbl
      .integer("offer_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("offers")
      .onDelete("restrict");
    tbl
      .integer("user_id")
      .references("id")
      .inTable("users");
    tbl.text("image").nullable();
    tbl.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("ads");
};
