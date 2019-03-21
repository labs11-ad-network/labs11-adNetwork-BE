exports.up = function(knex, Promise) {
  return knex.schema.createTable("ads", tbl => {
    tbl.increments();
    tbl.string("headline").nullable();
    tbl.string("tagline").nullable();
    tbl.string("message").nullable();
    tbl.string("cta_button").nullable();
    tbl.string("destination_url").nullable();
    tbl.string("back_img").nullable();
    tbl.string("size").nullable();
    tbl.boolean("active").defaultTo(false);
    tbl
      .integer("user_id")
      .references("id")
      .inTable("users");
    tbl.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("ads");
};
