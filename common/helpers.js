const db = require("../data/dbConfig");
const stripe = require("stripe")(process.env.SECRET_KEY);
const moment = require("moment");

const get = tbl => db(tbl);

const findBy = (tbl, filter) =>
  db(tbl)
    .where(filter)
    .first();

const findAllBy = (tbl, filter) => db(tbl).where(filter);

const add = (tbl, item) =>
  db(tbl)
    .insert(item)
    .returning("id");

const remove = (tbl, id) =>
  db(tbl)
    .where({ id })
    .del();

const removeAd = (tbl, filter) =>
  db(tbl)
    .where(filter)
    .del();

const update = (tbl, id, item) =>
  db(tbl)
    .where({ id })
    .update(item);

const updateAdByUser = (id, user_id, items) =>
  db("ads")
    .where({ id, user_id })
    .update({ ...items });

const updateStripe = (tbl, filter, item) =>
  db(tbl)
    .where(filter)
    .update(item);

const queryByDate = (tbl, started_at, ended_at) =>
  db(tbl)
    .where("created_at", ">=", started_at)
    .where("created_at", "<", ended_at);

const analyticsWithPricing = id =>
  db("agreements as ag")
    .join("analytics as an", "an.agreement_id", "ag.id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("ag.affiliate_id", id)
    .select("an.*", "o.price_per_click", "o.price_per_impression");

const actionCountAffiliate = (id, filter) =>
  db
    .select("an.*", "o.price_per_click", "o.price_per_impression")
    .from("analytics as an")
    .join("agreements as ag", "ag.affiliate_id", id)
    .join("offers as o", "ag.offer_id", "o.id")
    .where("action", filter);

const analyticsWithPricingAdvertiser = id =>
  db
    .select("an.*", "o.price_per_click", "o.price_per_impression")
    .from("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .join("offers as o", "ag.offer_id", "o.id")
    .where("user_id", id);

const getAdvertiserEmail = id =>
  db
    .select("u.*")
    .from("agreements as ag")
    .join("offers as o", "o.id", id)
    .join("users as u", "o.user_id", "u.id");

const actionCount = (filter, id) =>
  db
    .select()
    .from("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .join("offers as o", "ag.offer_id", "o.id")
    .where("user_id", id)
    .andWhere("action", filter);

const browserCountAdvertisers = (filter, id) =>
  db
    .select()
    .from("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .join("offers as o", "ag.offer_id", "o.id")
    .where("user_id", id)
    .andWhere("browser", filter);

const browserCountAffiliates = (filter, id) =>
  db
    .select()
    .from("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .join("offers as o", "ag.affiliate_id", id)
    // .where("user_id", id)
    .where("browser", filter);

const analyticsPerOfferWithPricing = (filter, id, offer_id) =>
  db("analytics as an")
    .join("agreements as ag", "an.agreement_id", "ag.id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("agreement_id", offer_id)
    .andWhere("affiliate_id", id)
    .andWhere("action", filter)
    .select("an.*", "o.price_per_click", "o.price_per_impression");

const browserCountPerOfferAffiliates = (filter, id, agreement_id) =>
  db("analytics as an")
    .join("agreements as ag", "an.agreement_id", "ag.id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("agreement_id", agreement_id)
    .andWhere("affiliate_id", id)
    .andWhere("browser", filter)
    .select("an.*", "o.price_per_click", "o.price_per_impression");

const analyticsPerOfferAdvertisers = (filter, id, offer_id) =>
  db("analytics as an")
    .join("agreements as ag", "an.agreement_id", "ag.id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("offer_id", offer_id)
    .andWhere("user_id", id)
    .andWhere("action", filter)
    .select("an.*", "o.price_per_click", "o.price_per_impression");

const analyticsPerOfferAdvertisersBrowsers = (filter, id, offer_id) =>
  db("analytics as an")
    .join("agreements as ag", "an.agreement_id", "ag.id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("offer_id", offer_id)
    .andWhere("user_id", id)
    .andWhere("browser", filter)
    .select("an.*", "o.price_per_click", "o.price_per_impression");

const affiliatesByOfferId = offer_id =>
  db("agreements as ag")
    .join("users as u", "ag.affiliate_id", "u.id")
    .where("offer_id", offer_id)
    .select("*");

const last30 = new Date(new Date().setDate(new Date().getDate() - 1 / 24));
const last60 = new Date(new Date().setDate(new Date().getDate() - 1 / 12));

const lastMonthAffiliates = (user_id, action, id) =>
  db("analytics as an ")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .where("ag.affiliate_id", user_id)
    .andWhere("an.created_at", ">=", last60)
    .andWhere("an.created_at", "<=", last30)
    .andWhere("an.action", action)
    .andWhere("an.agreement_id", id)
    .count()
    .first();

const thisMonthAffiliates = (user_id, action, id) =>
  db("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .where("ag.affiliate_id", user_id)
    .andWhere("an.created_at", ">=", last30)
    .andWhere("an.action", action)
    .andWhere("an.agreement_id", id)
    .count()
    .first();

const lastMonthAdvertiser = (user_id, action, id) =>
  db("analytics as an")
    .join("agreements as ag", "an.agreement_id", "ag.id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("o.user_id", user_id)
    .where("ag.offer_id", id)
    .andWhere("an.created_at", ">=", last60)
    .andWhere("an.created_at", "<=", last30)
    .andWhere("an.action", action)
    .count()
    .first();

const thisMonthAdvertiser = (user_id, action, id) =>
  db("analytics as an")
    .join("agreements as ag", "an.agreement_id", "ag.id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("o.user_id", user_id)
    .andWhere("ag.offer_id", id)
    .andWhere("an.created_at", ">=", last30)
    .andWhere("an.action", action)
    .count()
    .first();

const lastMonthAffiliatesAll = (user_id, action) =>
  db("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .where("ag.affiliate_id", user_id)
    .andWhere("an.created_at", ">=", last60)
    .andWhere("an.created_at", "<=", last30)
    .count()
    .first();

const thisMonthAffiliatesAll = (user_id, action) =>
  db("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .where("ag.affiliate_id", user_id)
    .andWhere("an.created_at", ">=", last30)
    .andWhere("an.action", action)
    .count()
    .first();

const lastMonthAdvertiserAll = (user_id, action) =>
  db("analytics as an")
    .join("agreements as ag", "an.agreement_id", "ag.id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("o.user_id", user_id)
    .andWhere("an.created_at", ">=", last60)
    .andWhere("an.created_at", "<=", last30)
    .andWhere("an.action", action)
    .count()
    .first();

const thisMonthAdvertiserAll = (user_id, action) =>
  db("analytics as an")
    .join("agreements as ag", "an.agreement_id", "ag.id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("o.user_id", user_id)
    .andWhere("an.created_at", ">=", last30)
    .andWhere("an.action", action)
    .count()
    .first();

const getAgreementsByAffiliate = affiliate_id =>
  db("agreements as ag")
    .join("offers as o", "ag.offer_id", "o.id")
    .where("affiliate_id", affiliate_id)
    .select("ag.*", "o.name");

const agreementsByUserId = user =>
  db
    .select("ag.*", "o.id as test_id")
    .from("agreements as ag")
    .join("offers as o", "o.id", "ag.offer_id")
    .where({ affiliate_id: user.id });

const allAdsByAffiliateId = affiliate_id =>
  db("agreements as ag")
    .join("ads as ad", "ag.offer_id", "ad.offer_id")
    .join("offers as o", "o.id", "ag.offer_id")
    .select("ad.*", "ag.id as agreement_id")
    .where("affiliate_id", affiliate_id)
    .andWhere("o.status", true)
    .andWhere("ag.active", true);

const offerAgreementsAffiliates = (user_id, allOffer) =>
  db
    .select()
    .from("agreements")
    .where({ affiliate_id: user_id })
    .andWhere({ offer_id: allOffer.id })
    .first();

const addPricingForAnalytics = () =>
  db("agreements as ag")
    .join("offers as o", "ag.offer_id", "o.id")
    .join("analytics as an", "ag.id", "an.agreement_id")
    .select(
      "ag.*",
      "o.user_id",
      "o.price_per_impression",
      "o.price_per_click",
      "o.budget",
      "an.*"
    );

const offersActionByOfferId = (offer, action) =>
  db("offers as o")
    .join("agreements as ag", "ag.offer_id", offer.id)
    .join("analytics as an", "ag.id", "an.agreement_id")
    .select("o.*", "an.*")
    .groupBy("o.id", "an.id", "an.action")
    .where("action", action);

const citiesFilteredById = (user_id, id) =>
  db.raw(
    `SELECT city, longitude, latitude,  count(*) as NUM
    FROM analytics
    JOIN agreements as ag ON ag.id = analytics.agreement_id
    WHERE ag.affiliate_id = ${user_id}
    AND ag.id = ${id}
    GROUP BY city, longitude, latitude`
  );

const citiesByAffiliateId = affiliate_id =>
  db("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .where("ag.affiliate_id", affiliate_id)
    .select("city", "longitude", "latitude")
    .count("* as num")
    .groupBy("city", "longitude", "latitude");

const citiesFilteredByAffiliateId = (affiliate_id, started_at, ended_at) =>
  db("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .where("ag.affiliate_id", affiliate_id)
    .select("city", "longitude", "latitude")
    .where("an.created_at", ">=", started_at)
    .andWhere("an.created_at", "<", ended_at)
    .count("* as num")
    .groupBy("city", "longitude", "latitude");

const citiesFilteredByIdAdvertiser = (user_id, id) =>
  db.raw(
    `SELECT city, longitude, latitude,  count(*) as NUM
      FROM analytics
      JOIN agreements as ag ON ag.id = analytics.agreement_id
      JOIN offers as o ON ag.offer_id = o.id
      WHERE o.user_id = ${user_id}
      AND o.id = ${id}
      GROUP BY city, longitude, latitude`
  );

const allCitiesFiltered = (id, started_at, ended_at) =>
  db("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .where("an.agreement_id", id)
    .select("city", "longitude", "latitude")
    .where("an.created_at", ">=", started_at)
    .andWhere("an.created_at", "<", ended_at)
    .count("* as num")
    .groupBy("city", "longitude", "latitude");

const allCitiesFilteredAdvertiser = (affiliate_id, started_at, ended_at) =>
  db("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .join("offers as o", "ag.offer_id", "o.id")
    .where("o.user_id", affiliate_id)
    .select("city", "longitude", "latitude")
    .where("an.created_at", ">=", started_at)
    .andWhere("an.created_at", "<", ended_at)
    .count("* as num")
    .groupBy("city", "longitude", "latitude");

const citiesFilteredByIdandUser = (user_id, id, started_at, ended_at) =>
  db("analytics as an")
    .join("agreements as ag", "ag.id", "an.agreement_id")
    .join("offers as o", "ag.offer_id", "o.id")
    .where("o.user_id", user_id)
    .andWhere("o.id", id)
    .select("city", "longitude", "latitude")
    .where("an.created_at", ">=", started_at)
    .andWhere("an.created_at", "<", ended_at)
    .count("* as num")
    .groupBy("city", "longitude", "latitude");

const citiesFilteredByUser = affiliate_id =>
  db.raw(
    `SELECT city, longitude, latitude,  count(*) as NUM
  FROM analytics
  JOIN agreements as ag ON ag.id = analytics.agreement_id
  JOIN offers as o ON ag.offer_id = o.id
  WHERE o.user_id = ${affiliate_id} GROUP BY city, longitude, latitude`
  );

const filteredDevicesById = (user_id, id, started_at, ended_at) =>
  db("analytics as an")
    .select("device")
    .count("device")
    .from("analytics")
    .join("agreements as ag", "ag.id", "analytics.agreement_id")
    .where("ag.affiliate_id", user_id)
    .andWhere("ag.id", id)
    .andWhere("analytics.created_at", ">=", started_at)
    .andWhere("analytics.created_at", "<", ended_at)
    .groupBy("analytics.device");

const filteredDevicesByIdandUser = (user_id, id, started_at, ended_at) =>
  db("analytics as an")
    .select("device")
    .count("device")
    .from("analytics")
    .join("agreements as ag", "ag.id", "analytics.agreement_id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("o.user_id", user_id)
    .andWhere("o.id", id)
    .where("analytics.created_at", ">=", started_at)
    .andWhere("analytics.created_at", "<", ended_at)
    .groupBy("analytics.device");

const filteredDevicesByUser = (affiliate_id, started_at, ended_at) =>
  db("analytics as an")
    .select("device")
    .count("device")
    .from("analytics")
    .join("agreements as ag", "ag.id", "analytics.agreement_id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("o.user_id", affiliate_id)
    .where("analytics.created_at", ">=", started_at)
    .andWhere("analytics.created_at", "<", ended_at)
    .groupBy("analytics.device");

const deviceByUser = affiliate_id =>
  db("analytics as an")
    .select("device")
    .count("device")
    .from("analytics")
    .join("agreements as ag", "ag.id", "analytics.agreement_id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("o.user_id", affiliate_id)
    .groupBy("analytics.device");

const devicesByIdandUser = (user_id, id) =>
  db("analytics as an")
    .select("device")
    .count("device")
    .from("analytics")
    .join("agreements as ag", "ag.id", "analytics.agreement_id")
    .join("offers as o", "o.id", "ag.offer_id")
    .where("o.user_id", user_id)
    .andWhere("o.id", id)
    .groupBy("analytics.device");

const affiliateDevicesById = (user_id, id) =>
  db("analytics as an")
    .select("device")
    .count("device")
    .from("analytics")
    .join("agreements as ag", "ag.id", "analytics.agreement_id")
    .where("ag.affiliate_id", user_id)
    .andWhere("ag.id", id)
    .groupBy("analytics.device");

const affiliateDevices = affiliate_id =>
  db("analytics as an")
    .select("device")
    .count("device")
    .from("analytics")
    .join("agreements as ag", "ag.id", "analytics.agreement_id")
    .where("ag.affiliate_id", affiliate_id)
    .groupBy("analytics.device");

const filteredDevicesByUserId = (affiliate_id, started_at, ended_at) =>
  db("analytics as an")
    .select("device")
    .count("device")
    .from("analytics")
    .join("agreements as ag", "ag.id", "analytics.agreement_id")
    .where("ag.affiliate_id", affiliate_id)
    .andWhere("analytics.created_at", ">=", started_at)
    .andWhere("analytics.created_at", "<", ended_at)
    .groupBy("analytics.device");

const categoriesAdvertiser = user_id =>
  db("offers as o")
    .select("category")
    .count("an.*")
    .from("offers as o")
    .join("agreements as ag", "ag.offer_id", "o.id")
    .join("analytics as an", "an.agreement_id", "ag.id")
    .where("o.user_id", user_id)
    .groupBy("o.category");

const categoriesAffiliate = affiliate_id =>
  db("offers as o")
    .select("category")
    .count("an.*")
    .from("offers as o")
    .join("agreements as ag", "ag.offer_id", "o.id")
    .join("analytics as an", "an.agreement_id", "ag.id")
    .where("ag.affiliate_id", affiliate_id)
    .groupBy("o.category");

const stripeGrowthAffiliate = async stripe_payout_id => {
  if (!stripe_payout_id) return 0;

  const lastMonthStripe = await stripe.transfers.list({
    destination: stripe_payout_id,
    created: {
      gte: moment(last60, "YYYY-MM-DD hh:mm:ss").unix(),
      lte: moment(last30, "YYYY-MM-DD hh:mm:ss").unix()
    }
  });
  let totalLastMonth = 0;

  lastMonthStripe.data.map(transfer => {
    totalLastMonth += transfer.amount;
  });

  const thisMonthStripe = await stripe.transfers.list({
    destination: stripe_payout_id,
    created: {
      gte: moment(last30, "YYYY-MM-DD hh:mm:ss").unix()
    }
  });

  let totalThisMonth = 0;

  thisMonthStripe.data.map(transfer => {
    totalThisMonth += transfer.amount;
  });

  const stripeGrowth =
    ((totalThisMonth - totalLastMonth) / totalThisMonth) * 100;

  return stripeGrowth;
};

const stripeGrowthAdvertisers = async stripe_cust_id => {
  if (!stripe_cust_id) return 0;

  const lastMonthStripe = await stripe.charges.list({
    customer: stripe_cust_id,
    created: {
      gte: moment(last60, "YYYY-MM-DD hh:mm:ss").unix(),
      lte: moment(last30, "YYYY-MM-DD hh:mm:ss").unix()
    }
  });

  const thisMonthStripe = await stripe.charges.list({
    customer: stripe_cust_id,
    created: {
      gte: moment(last30, "YYYY-MM-DD hh:mm:ss").unix()
    }
  });

  let totalLastMonth = 0;

  lastMonthStripe.data.map(charge => {
    totalLastMonth += charge.amount;
  });

  let totalThisMonth = 0;

  thisMonthStripe.data.map(charge => {
    totalThisMonth += charge.amount;
  });

  const stripeGrowth =
    ((totalThisMonth - totalLastMonth) / totalThisMonth) * 100;

  return stripeGrowth;
};
module.exports = {
  get,
  findBy,
  add,
  remove,
  removeAd,
  update,
  updateAdByUser,
  updateStripe,
  findAllBy,
  queryByDate,
  analyticsWithPricing,
  analyticsWithPricingAdvertiser,
  getAdvertiserEmail,
  actionCount,
  actionCountAffiliate,
  browserCountAdvertisers,
  browserCountAffiliates,
  analyticsPerOfferWithPricing,
  browserCountPerOfferAffiliates,
  analyticsPerOfferAdvertisers,
  analyticsPerOfferAdvertisersBrowsers,
  affiliatesByOfferId,
  lastMonthAffiliates,
  thisMonthAffiliates,
  lastMonthAdvertiser,
  thisMonthAdvertiser,
  lastMonthAffiliatesAll,
  thisMonthAffiliatesAll,
  lastMonthAdvertiserAll,
  thisMonthAdvertiserAll,
  getAgreementsByAffiliate,
  allAdsByAffiliateId,
  offerAgreementsAffiliates,
  agreementsByUserId,
  addPricingForAnalytics,
  offersActionByOfferId,
  allCitiesFiltered,
  filteredDevicesById,
  citiesFilteredById,
  affiliateDevicesById,
  citiesFilteredByIdandUser,
  filteredDevicesByIdandUser,
  devicesByIdandUser,
  citiesFilteredByIdAdvertiser,
  citiesByAffiliateId,
  citiesFilteredByAffiliateId,
  filteredDevicesByUserId,
  affiliateDevices,
  filteredDevicesByUser,
  allCitiesFilteredAdvertiser,
  citiesFilteredByUser,
  deviceByUser,
  stripeGrowthAffiliate,
  stripeGrowthAdvertisers,
  categoriesAdvertiser,
  categoriesAffiliate
};
