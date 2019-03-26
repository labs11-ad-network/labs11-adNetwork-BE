exports.up = function(knex, Promise) {
  return knex.schema.createTable("offers", t => {
    t.increments();
    t.float("price_per_click")
      .nullable()
      .defaultTo(0);
    t.float("price_per_impression")
      .nullable()
      .defaultTo(0);
    t.integer("num_applicants")
      .nullable()
      .defaultTo(0);
    t.float("budget").notNullable();
    t.string("name").notNullable();
    t.string("description").notNullable();
    t.string("category").notNullable();
    t.string("currency").notNullable();
    t.boolean("status").defaultTo(true);
    t.integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("restrict");
    t.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("offers");
};
