exports.up = function(knex, Promise) {
  return knex.schema.createTable("users", t => {
    t.increments();
    t.integer("balance")
      .notNullable()
      .defaultTo(0);
    t.string("first_name", 128).notNullable();
    t.string("last_name", 128).notNullable();
    t.string("email", 512)
      .notNullable()
      .unique();
    t.string("password", 128).nullable();
    t.string("phone", 32).notNullable();
    t.string("image_url", 128).nullable();
    t.string("acct_type", 16).notNullable();
    t.string("stripe_cust_id", 128)
      .nullable()
      .unique();
    t.string("oauth_token", 256).nullable();
    t.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("users");
};
