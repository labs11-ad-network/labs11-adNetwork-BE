const db = require("../data/dbConfig");

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
    .select("ad.*", "ag.id as agreement_id")
    .where("affiliate_id", affiliate_id);

const offerAgreementsAffiliates = (user_id, allOffer) =>
  db
    .select()
    .from("agreements")
    .where({ affiliate_id: user_id })
    .andWhere({ offer_id: allOffer.id })
    .first();

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
  agreementsByUserId
};
