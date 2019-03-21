exports.up = function(knex, Promise) {
  return knex.schema.createTable("agreements", t => {
    t.increments();
    t.unique(["affiliate_id", "offer_id"]);
    t.integer("offer_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("offers")
      .onDelete("restrict");
    t.integer("affiliate_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("restrict");
    t.integer("advertiser_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("restrict");
    t.integer("clicks")
      .unsigned()
      .nullable()
      .defaultTo(0);
    t.integer("impressions")
      .unsigned()
      .nullable()
      .defaultTo(0);
    t.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("agreements");
};
