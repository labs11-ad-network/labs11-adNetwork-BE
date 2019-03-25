exports.up = function (knex, Promise) {
  return knex.schema.createTable("agreements", t => {
    t.increments();
    t.unique(["offer_id", "affiliate_id"]);


    t.integer("offer_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("offers")
      .onDelete("CASCADE");

    t.integer("affiliate_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("restrict");

    t.timestamps(true, true);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists("agreements");
};
