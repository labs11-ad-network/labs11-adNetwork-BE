const route = require("express").Router();
const models = require("../../common/helpers");
const { authenticate } = require("../../common/authentication");
const emailer = require("../../common/mailer");
const stripe = require("stripe")(process.env.SECRET_KEY);

const iplocation = require("iplocation").default;
const UAParser = require("ua-parser-js");
const moment = require("moment");

// @route    /api/analytics
// @desc     POST analytics
// @Access   Public
route.post("/", async (req, res) => {
  const { action, browser, ip, referrer, agreement_id, userAgent } = req.body;
  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const parser = new UAParser(userAgent);

  try {
    iplocation(ipAddr, [], async (error, location) => {
      const enterAction = await models
        .add("analytics", {
          action,
          browser: parser.getBrowser().name,
          ip: ipAddr,
          referrer,
          agreement_id,
          device: parser.getDevice().model || "desktop",
          country: location.country || "",
          region: location.region || "",
          city: location.city || "",
          postal: location.postal || "",
          latitude: location.latitude || "",
          longitude: location.longitude || ""
        })
        .catch(() => {
          return res.json({ message: "Failed to add action" });
        });
      if (enterAction[0]) {
        const payments = await models.addPricingForAnalytics();

        payments.map(async user => {
          const advertiser = await models.findBy("users", { id: user.user_id });
          const affiliate = await models.findBy("users", {
            id: user.affiliate_id
          });

          if (user.budget > 0) {
            if (action === "impression") {
              // advertiser
              await models.update("users", user.user_id, {
                amount: advertiser.amount - user.price_per_impression
              });

              await models.update("offers", user.offer_id, {
                budget: user.budget - user.price_per_impression
              });

              // affiliate
              await models.update("users", user.affiliate_id, {
                amount: affiliate.amount + user.price_per_impression
              });
            } else if (action === "click") {
              // advertiser
              await models.update("users", user.user_id, {
                amount: advertiser.amount - user.price_per_click
              });
              await models.update("offers", user.offer_id, {
                budget: user.budget - user.price_per_click
              });
              // affiliate
              await models.update("users", user.affiliate_id, {
                amount: affiliate.amount + user.price_per_click
              });
            }
          } else {
            const userEmail = await models.findBy("users", {
              id: user.user_id
            });
            emailer(
              res,
              userEmail,
              "Your advertisement has reached it's budget",
              "Your ad was stopped because it has reached the budget you have set up for it, if you want to keep running your add, update your budget immediately, THANK YOU!"
            );
            await models.update("offers", user.offer_id, { status: false });
          }
        });
      }
      res.end();
    });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    /api/analytics/:id
// @desc     GET analytics
// @Access   Private
route.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.decoded.id;
  const { acct_type, stripe_payout_id, stripe_cust_id } = req.decoded;
  const { started_at, ended_at } = req.query;
  try {
    if (acct_type === "affiliate") {
      const offersRanking = await models.get("offers").map(async offer => {
        const offersClick = await models.offersActionByOfferId(offer, "click");

        const offersImpression = await models.offersActionByOfferId(
          offer,
          "impression"
        );

        offer.ctr =
          Math.floor(
            (offersClick.length / offersImpression.length) * 100 * 100
          ) / 100 || 0;

        return offer;
      });

      const categories = await models.categoriesAffiliate(user_id);

      if (started_at && ended_at) {
        const lastMonthsImpressions = await models.lastMonthAffiliates(
          user_id,
          "impression",
          id
        );

        const thisMonthsImpressions = await models.thisMonthAffiliates(
          user_id,
          "impression",
          id
        );

        const lastMonthClicks = await models.lastMonthAffiliates(
          user_id,
          "click",
          id
        );

        const thisMonthClicks = await models.thisMonthAffiliates(
          user_id,
          "click",
          id
        );

        const lastMonthConversions = await models.lastMonthAffiliates(
          user_id,
          "conversion",
          id
        );

        const thisMonthConversions = await models.thisMonthAffiliates(
          user_id,
          "conversion",
          id
        );

        const impressionsGrowth =
          ((thisMonthsImpressions.count - lastMonthsImpressions.count) /
            thisMonthsImpressions.count) *
          100;

        const clicksGrowth =
          ((thisMonthClicks.count - lastMonthClicks.count) /
            thisMonthClicks.count) *
          100;

        const conversionsGrowth =
          ((thisMonthConversions.count - lastMonthConversions.count) /
            thisMonthConversions.count) *
          100;

        const cities = await models.allCitiesFiltered(id, started_at, ended_at);

        const devices = await models.filteredDevicesById(
          user_id,
          id,
          started_at,
          ended_at
        );

        // send the id of an agreeement and get the analytics for that agreement formatter like below
        const affiliateAnalyticsClicks = await models
          .analyticsPerOfferWithPricing("click", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const affiliateAnalyticsImpressions = await models
          .analyticsPerOfferWithPricing("impression", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const affiliateAnalyticsConversions = await models
          .analyticsPerOfferWithPricing("conversion", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const chromeCount = await models
          .browserCountPerOfferAffiliates("Chrome", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const safariCount = await models
          .browserCountPerOfferAffiliates("Safari", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const firefoxCount = await models
          .browserCountPerOfferAffiliates("Firefox", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const edgeCount = await models
          .browserCountPerOfferAffiliates("Edge", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const otherCount = await models
          .browserCountPerOfferAffiliates("Other", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        await stripe.transfers.list(
          {
            destination: stripe_payout_id,
            created: {
              gte: moment(started_at, "YYYY-MM-DD hh:mm:ss").unix(),
              lte: moment(ended_at, "YYYY-MM-DD hh:mm:ss").unix()
            }
          },
          async (err, transfers) => {
            res.json({
              clicks: affiliateAnalyticsClicks,
              impressions: affiliateAnalyticsImpressions,
              conversions: affiliateAnalyticsConversions,
              actionCount: {
                impressions: Number(affiliateAnalyticsImpressions.length),
                clicks: Number(affiliateAnalyticsClicks.length),
                conversions: Number(affiliateAnalyticsConversions.length)
              },
              browserCount: {
                chrome: chromeCount.length,
                safari: safariCount.length,
                edge: edgeCount.length,
                firefox: firefoxCount.length,
                other: otherCount.length
              },
              cities: cities,
              growth: {
                clicks: clicksGrowth,
                impressions: impressionsGrowth,
                conversions: conversionsGrowth
              },
              offersRanking: offersRanking.sort((a, b) => b.ctr - a.ctr),
              devices,
              payouts: err ? [] : transfers.data,
              categories,
              stripeGrowth: await models.stripeGrowthAffiliate(stripe_payout_id)
            });
          }
        );
      } else {
        const lastMonthsImpressions = await models.lastMonthAffiliates(
          user_id,
          "impression",
          id
        );

        const thisMonthsImpressions = await models.thisMonthAffiliates(
          user_id,
          "impression",
          id
        );

        const lastMonthClicks = await models.lastMonthAffiliates(
          user_id,
          "click",
          id
        );

        const thisMonthClicks = await models.thisMonthAffiliates(
          user_id,
          "click",
          id
        );

        const lastMonthConversions = await models.lastMonthAffiliates(
          user_id,
          "conversion",
          id
        );

        const thisMonthConversions = await models.thisMonthAffiliates(
          user_id,
          "conversion",
          id
        );

        const impressionsGrowth =
          ((thisMonthsImpressions.count - lastMonthsImpressions.count) /
            thisMonthsImpressions.count) *
          100;

        const clicksGrowth =
          ((thisMonthClicks.count - lastMonthClicks.count) /
            thisMonthClicks.count) *
          100;

        const conversionsGrowth =
          ((thisMonthConversions.count - lastMonthConversions.count) /
            thisMonthConversions.count) *
          100;

        const cities = await models.citiesFilteredById(user_id, id);

        const devices = await models.affiliateDevicesById(user_id, id);

        // send the id of an agreeement and get the analytics for that agreement formatter like below
        const affiliateAnalyticsClicks = await models
          .analyticsPerOfferWithPricing("click", user_id, id)
          .orderBy("an.id", "desc");

        const affiliateAnalyticsImpressions = await models
          .analyticsPerOfferWithPricing("impression", user_id, id)
          .orderBy("an.id", "desc");

        const affiliateAnalyticsConversions = await models
          .analyticsPerOfferWithPricing("conversion", user_id, id)
          .orderBy("an.id", "desc");

        const chromeCount = await models
          .browserCountPerOfferAffiliates("Chrome", user_id, id)
          .orderBy("an.id", "desc");

        const safariCount = await models
          .browserCountPerOfferAffiliates("Safari", user_id, id)
          .orderBy("an.id", "desc");

        const firefoxCount = await models
          .browserCountPerOfferAffiliates("Firefox", user_id, id)
          .orderBy("an.id", "desc");

        const edgeCount = await models
          .browserCountPerOfferAffiliates("Edge", user_id, id)
          .orderBy("an.id", "desc");

        const otherCount = await models
          .browserCountPerOfferAffiliates("Other", user_id, id)
          .orderBy("an.id", "desc");

        await stripe.transfers.list(
          {
            destination: stripe_payout_id
          },
          async (err, transfers) => {
            res.json({
              clicks: affiliateAnalyticsClicks,
              impressions: affiliateAnalyticsImpressions,
              conversions: affiliateAnalyticsConversions,
              actionCount: {
                impressions: Number(affiliateAnalyticsImpressions.length),
                clicks: Number(affiliateAnalyticsClicks.length),
                conversions: Number(affiliateAnalyticsConversions.length)
              },
              browserCount: {
                chrome: chromeCount.length,
                safari: safariCount.length,
                edge: edgeCount.length,
                firefox: firefoxCount.length,
                other: otherCount.length
              },
              cities: cities.rows,
              growth: {
                clicks: clicksGrowth,
                impressions: impressionsGrowth,
                conversions: conversionsGrowth
              },
              offersRanking: offersRanking.sort((a, b) => b.ctr - a.ctr),
              devices,
              payouts: err ? [] : transfers.data,
              categories,
              stripeGrowth: await models.stripeGrowthAffiliate(stripe_payout_id)
            });
          }
        );
      }
    } else if (acct_type === "advertiser") {
      const offersRanking = await models
        .findAllBy("offers", { user_id })
        .map(async offer => {
          const offersClick = await models.offersActionByOfferId(
            offer,
            "click"
          );

          const offersImpression = await models.offersActionByOfferId(
            offer,
            "impression"
          );

          offer.ctr =
            Math.floor(
              (offersClick.length / offersImpression.length) * 100 * 100
            ) / 100 || 0;

          return offer;
        });
      const categories = await models.categoriesAdvertiser(user_id);

      if (started_at && ended_at) {
        const lastMonthsImpressions = await models.lastMonthAdvertiser(
          user_id,
          "impression",
          id
        );

        const thisMonthsImpressions = await models.thisMonthAdvertiser(
          user_id,
          "impression",
          id
        );

        const lastMonthClicks = await models.lastMonthAdvertiser(
          user_id,
          "click",
          id
        );

        const thisMonthClicks = await models.thisMonthAdvertiser(
          user_id,
          "click",
          id
        );

        const lastMonthConversions = await models.lastMonthAdvertiser(
          user_id,
          "conversion",
          id
        );

        const thisMonthConversions = await models.thisMonthAdvertiser(
          user_id,
          "conversion",
          id
        );

        const impressionsGrowth =
          ((thisMonthsImpressions.count - lastMonthsImpressions.count) /
            thisMonthsImpressions.count) *
          100;

        const clicksGrowth =
          ((thisMonthClicks.count - lastMonthClicks.count) /
            thisMonthClicks.count) *
          100;

        const conversionsGrowth =
          ((thisMonthConversions.count - lastMonthConversions.count) /
            thisMonthConversions.count) *
          100;

        const cities = await models.citiesFilteredByIdandUser(
          user_id,
          id,
          started_at,
          ended_at
        );

        const devices = await models.filteredDevicesByIdandUser(
          user_id,
          id,
          started_at,
          ended_at
        );

        // send the id of an offer and get the analytics for that offer formatted like below
        const advertiserAnalyticsClicks = await models
          .analyticsPerOfferAdvertisers("click", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const advertiserAnalyticsImpressions = await models
          .analyticsPerOfferAdvertisers("impression", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const advertiserAnalyticsConversions = await models
          .analyticsPerOfferAdvertisers("conversion", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const chromeCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Chrome", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const safariCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Safari", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const firefoxCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Firefox", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const edgeCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Edge", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const otherCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Other", user_id, id)
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        await stripe.charges.list(
          {
            customer: stripe_cust_id,
            created: {
              gte: moment(started_at, "YYYY-MM-DD hh:mm:ss").unix(),
              lte: moment(ended_at, "YYYY-MM-DD hh:mm:ss").unix()
            }
          },
          async (err, charges) => {
            res.json({
              clicks: advertiserAnalyticsClicks,
              impressions: advertiserAnalyticsImpressions,
              conversions: advertiserAnalyticsConversions,
              actionCount: {
                impressions: Number(advertiserAnalyticsImpressions.length),
                clicks: Number(advertiserAnalyticsClicks.length),
                conversions: Number(advertiserAnalyticsConversions.length)
              },
              browserCount: {
                chrome: chromeCount.length,
                safari: safariCount.length,
                edge: edgeCount.length,
                firefox: firefoxCount.length,
                other: otherCount.length
              },
              cities: cities,
              growth: {
                clicks: clicksGrowth,
                impressions: impressionsGrowth,
                conversions: conversionsGrowth
              },
              offersRanking: offersRanking.sort((a, b) => b.ctr - a.ctr),
              devices,
              payments: err ? [] : charges.data,
              categories,
              stripeGrowth: await models.stripeGrowthAdvertisers(stripe_cust_id)
            });
          }
        );
      } else {
        const devices = await models.devicesByIdandUser(user_id, id);

        const lastMonthsImpressions = await models.lastMonthAdvertiser(
          user_id,
          "impression",
          id
        );

        const thisMonthsImpressions = await models.thisMonthAdvertiser(
          user_id,
          "impression",
          id
        );

        const lastMonthClicks = await models.lastMonthAdvertiser(
          user_id,
          "click",
          id
        );

        const thisMonthClicks = await models.thisMonthAdvertiser(
          user_id,
          "click",
          id
        );

        const lastMonthConversions = await models.lastMonthAdvertiser(
          user_id,
          "conversion",
          id
        );

        const thisMonthConversions = await models.thisMonthAdvertiser(
          user_id,
          "conversion",
          id
        );

        const impressionsGrowth =
          ((thisMonthsImpressions.count - lastMonthsImpressions.count) /
            thisMonthsImpressions.count) *
          100;

        const clicksGrowth =
          ((thisMonthClicks.count - lastMonthClicks.count) /
            thisMonthClicks.count) *
          100;

        const conversionsGrowth =
          ((thisMonthConversions.count - lastMonthConversions.count) /
            thisMonthConversions.count) *
          100;

        const cities = await models.citiesFilteredByIdAdvertiser(user_id, id);
        // send the id of an offer and get the analytics for that offer formatted like below
        const advertiserAnalyticsClicks = await models
          .analyticsPerOfferAdvertisers("click", user_id, id)
          .orderBy("an.id", "desc");

        const advertiserAnalyticsImpressions = await models
          .analyticsPerOfferAdvertisers("impression", user_id, id)
          .orderBy("an.id", "desc");

        const advertiserAnalyticsConversions = await models
          .analyticsPerOfferAdvertisers("conversion", user_id, id)
          .orderBy("an.id", "desc");

        const chromeCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Chrome", user_id, id)
          .orderBy("an.id", "desc");

        const safariCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Safari", user_id, id)
          .orderBy("an.id", "desc");

        const firefoxCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Firefox", user_id, id)
          .orderBy("an.id", "desc");

        const edgeCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Edge", user_id, id)
          .orderBy("an.id", "desc");

        const otherCount = await models
          .analyticsPerOfferAdvertisersBrowsers("Other", user_id, id)
          .orderBy("an.id", "desc");

        await stripe.charges.list(
          {
            customer: stripe_cust_id
          },
          async (err, charges) => {
            res.json({
              clicks: advertiserAnalyticsClicks,
              impressions: advertiserAnalyticsImpressions,
              conversions: advertiserAnalyticsConversions,
              actionCount: {
                impressions: Number(advertiserAnalyticsImpressions.length),
                clicks: Number(advertiserAnalyticsClicks.length),
                conversions: Number(advertiserAnalyticsConversions.length)
              },
              browserCount: {
                chrome: chromeCount.length,
                safari: safariCount.length,
                edge: edgeCount.length,
                firefox: firefoxCount.length,
                other: otherCount.length
              },
              cities: cities.rows,
              growth: {
                clicks: clicksGrowth,
                impressions: impressionsGrowth,
                conversions: conversionsGrowth
              },
              offersRanking: offersRanking.sort((a, b) => b.ctr - a.ctr),
              devices,
              payments: err ? [] : charges.data,
              categories,
              stripeGrowth: await models.stripeGrowthAdvertisers(stripe_cust_id)
            });
          }
        );
      }
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

// @route    /api/analytics
// @desc     analytics
// @Access   Private
route.get("/", authenticate, async (req, res) => {
  // Current logged in user
  const affiliate_id = req.decoded.id;
  const { acct_type, stripe_payout_id, stripe_cust_id } = req.decoded;

  // // destructuring the query

  const { action, started_at, ended_at, agreement_id } = req.query;

  try {
    if (acct_type === "affiliate") {
      const offersRanking = await models.get("offers").map(async offer => {
        const offersClick = await models.offersActionByOfferId(offer, "click");

        const offersImpression = await models.offersActionByOfferId(
          offer,
          "impression"
        );

        offer.ctr =
          Math.floor(
            (offersClick.length / offersImpression.length) * 100 * 100
          ) / 100 || 0;

        return offer;
      });

      const categories = await models.categoriesAffiliate(affiliate_id);
      const lastMonthsImpressions = await models.lastMonthAffiliatesAll(
        affiliate_id,
        "impression"
      );

      const thisMonthsImpressions = await models.thisMonthAffiliatesAll(
        affiliate_id,
        "impression"
      );

      const lastMonthClicks = await models.lastMonthAffiliatesAll(
        affiliate_id,
        "click"
      );

      const thisMonthClicks = await models.thisMonthAffiliatesAll(
        affiliate_id,
        "click"
      );

      const lastMonthConversions = await models.lastMonthAffiliatesAll(
        affiliate_id,
        "conversion"
      );

      const thisMonthConversions = await models.thisMonthAffiliatesAll(
        affiliate_id,
        "conversion"
      );

      const impressionsGrowth =
        ((thisMonthsImpressions.count - lastMonthsImpressions.count) /
          thisMonthsImpressions.count) *
        100;

      const clicksGrowth =
        ((thisMonthClicks.count - lastMonthClicks.count) /
          thisMonthClicks.count) *
        100;

      const conversionsGrowth =
        ((thisMonthConversions.count - lastMonthConversions.count) /
          thisMonthConversions.count) *
        100;

      const cities = await models.citiesByAffiliateId(affiliate_id);

      if (!action && started_at && ended_at) {
        const devices = await models.filteredDevicesByUserId(
          affiliate_id,
          started_at,
          ended_at
        );

        const lastMonthsImpressionsFiltered = await models
          .lastMonthAffiliatesAll(affiliate_id, "impression")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const thisMonthsImpressionsFiltered = await models
          .thisMonthAffiliatesAll(affiliate_id, "impression")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const lastMonthClicksFiltered = await models
          .lastMonthAffiliatesAll(affiliate_id, "click")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const thisMonthClicksFiltered = await models
          .thisMonthAffiliatesAll(affiliate_id, "click")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const lastMonthConversionsFiltered = await models
          .lastMonthAffiliatesAll(affiliate_id, "conversion")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const thisMonthConversionsFiltered = await models
          .thisMonthAffiliatesAll(affiliate_id, "conversion")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const citiesFiltered = await models.citiesFilteredByAffiliateId(
          affiliate_id,
          started_at,
          ended_at
        );

        const getAffiliateClicksFiltered = await models
          .analyticsWithPricing(affiliate_id)
          .where("action", "click")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const getAffiliateImpressionsFiltered = await models
          .analyticsWithPricing(affiliate_id)
          .where("action", "impression")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const getAffiliateConversionFiltered = await models
          .analyticsWithPricing(affiliate_id)
          .where("action", "conversion")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const chromeAnalyticsFiltered = await await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Chrome")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const safariAnalyticsFiltered = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Safari")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const edgeAnalyticsFiltered = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Edge")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const firefoxAnalyticsFiltered = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Firefox")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const otherAnalyticsFiltered = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Other")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const impressionsGrowthFiltered =
          ((thisMonthsImpressionsFiltered.count -
            lastMonthsImpressionsFiltered.count) /
            thisMonthsImpressionsFiltered.count) *
          100;
        const clicksGrowthFiltered =
          ((thisMonthClicksFiltered.count - lastMonthClicksFiltered.count) /
            thisMonthClicksFiltered.count) *
          100;
        const conversionsGrowthFiltered =
          ((thisMonthConversionsFiltered.count -
            lastMonthConversionsFiltered.count) /
            thisMonthConversionsFiltered.count) *
          100;

        await stripe.transfers.list(
          {
            destination: stripe_payout_id,
            created: {
              gte: moment(started_at, "YYYY-MM-DD hh:mm:ss").unix(),
              lte: moment(ended_at, "YYYY-MM-DD hh:mm:ss").unix()
            }
          },
          async (err, transfers) => {
            res.json({
              clicks: getAffiliateClicksFiltered,
              impressions: getAffiliateImpressionsFiltered,
              conversions: getAffiliateConversionFiltered,
              actionCount: {
                impressions: Number(getAffiliateImpressionsFiltered.length),
                clicks: Number(getAffiliateClicksFiltered.length),
                conversions: Number(getAffiliateConversionFiltered.length)
              },
              browserCount: {
                chrome: chromeAnalyticsFiltered.length,
                safari: safariAnalyticsFiltered.length,
                edge: edgeAnalyticsFiltered.length,
                firefox: firefoxAnalyticsFiltered.length,
                other: otherAnalyticsFiltered.length
              },
              cities: citiesFiltered,
              growth: {
                clicks: clicksGrowthFiltered,
                impressions: impressionsGrowthFiltered,
                conversions: conversionsGrowthFiltered
              },
              offersRanking: offersRanking.sort((a, b) => b.ctr - a.ctr),
              devices,
              payouts: err ? [] : transfers.data,
              categories,
              stripeGrowth: await models.stripeGrowthAffiliate(stripe_payout_id)
            });
          }
        );
      } else {
        const devices = await models.affiliateDevices(affiliate_id);

        // all analytics that match the logged in user
        const getAffiliateClicks = await models
          .analyticsWithPricing(affiliate_id)
          .where("action", "click")
          .orderBy("an.id", "desc");

        const getAffiliateImpressions = await models
          .analyticsWithPricing(affiliate_id)
          .where("action", "impression")
          .orderBy("an.id", "desc");

        const getAffiliateConversion = await models
          .analyticsWithPricing(affiliate_id)
          .where("action", "conversion")
          .orderBy("an.id", "desc");

        const chromeAnalytics = await await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Chrome")
          .orderBy("an.id", "desc");

        const safariAnalytics = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Safari")
          .orderBy("an.id", "desc");

        const edgeAnalytics = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Edge")
          .orderBy("an.id", "desc");

        const firefoxAnalytics = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Firefox")
          .orderBy("an.id", "desc");

        const otherAnalytics = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Other")
          .orderBy("an.id", "desc");

        await stripe.transfers.list(
          {
            destination: stripe_payout_id
          },
          async (err, transfers) => {
            res.json({
              clicks: getAffiliateClicks,
              impressions: getAffiliateImpressions,
              conversions: getAffiliateConversion,
              actionCount: {
                impressions: Number(getAffiliateImpressions.length),
                clicks: Number(getAffiliateClicks.length),
                conversions: Number(getAffiliateConversion.length)
              },
              browserCount: {
                chrome: chromeAnalytics.length,
                safari: safariAnalytics.length,
                edge: edgeAnalytics.length,
                firefox: firefoxAnalytics.length,
                other: otherAnalytics.length
              },
              cities: cities,
              growth: {
                clicks: clicksGrowth,
                impressions: impressionsGrowth,
                conversions: conversionsGrowth
              },
              offersRanking: offersRanking.sort((a, b) => b.ctr - a.ctr),
              devices,
              payouts: err ? [] : transfers.data,
              categories,
              stripeGrowth: await models.stripeGrowthAffiliate(stripe_payout_id)
            });
          }
        );
      }
    } else if (acct_type === "advertiser") {
      const offersRanking = await models
        .findAllBy("offers", { user_id: affiliate_id })
        .map(async offer => {
          const offersClick = await models.offersActionByOfferId(
            offer,
            "click"
          );

          const offersImpression = await models.offersActionByOfferId(
            offer,
            "impression"
          );

          offer.ctr =
            Math.floor(
              (offersClick.length / offersImpression.length) * 100 * 100
            ) / 100 || 0;

          return offer;
        });
      const categories = await models.categoriesAdvertiser(affiliate_id);
      if (started_at && ended_at) {
        const devices = await models.filteredDevicesByUser(
          affiliate_id,
          started_at,
          ended_at
        );

        const lastMonthsImpressionsFiltered = await models
          .lastMonthAdvertiserAll(affiliate_id, "impression")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const thisMonthsImpressionsFiltered = await models
          .thisMonthAdvertiserAll(affiliate_id, "impression")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const lastMonthClicksFiltered = await models
          .lastMonthAdvertiserAll(affiliate_id, "click")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const thisMonthClicksFiltered = await models
          .thisMonthAdvertiserAll(affiliate_id, "click")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const lastMonthConversionsFiltered = await models
          .lastMonthAdvertiserAll(affiliate_id, "conversion")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const thisMonthConversionsFiltered = await models
          .thisMonthAdvertiserAll(affiliate_id, "conversion")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at);

        const citiesFiltered = await models.allCitiesFilteredAdvertiser(
          affiliate_id,
          started_at,
          ended_at
        );

        const getAdvertisersClicksFiltered = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .where("action", "click")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const getAdvertisersImpressionsFiltered = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .where("action", "impression")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const getAdvertisersConversionFiltered = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .where("action", "conversion")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const chromeAnalyticsFiltered = await await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .where("browser", "Chrome")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const safariAnalyticsFiltered = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .where("browser", "Safari")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const edgeAnalyticsFiltered = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .where("browser", "Edge")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const firefoxAnalyticsFiltered = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .where("browser", "Firefox")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const otherAnalyticsFiltered = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .where("browser", "Other")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .orderBy("an.id", "desc");

        const impressionsGrowthFiltered =
          ((thisMonthsImpressionsFiltered.count -
            lastMonthsImpressionsFiltered.count) /
            thisMonthsImpressionsFiltered.count) *
          100;
        const clicksGrowthFiltered =
          ((thisMonthClicksFiltered.count - lastMonthClicksFiltered.count) /
            thisMonthClicksFiltered.count) *
          100;
        const conversionsGrowthFiltered =
          ((thisMonthConversionsFiltered.count -
            lastMonthConversionsFiltered.count) /
            thisMonthConversionsFiltered.count) *
          100;

        await stripe.charges.list(
          {
            customer: stripe_cust_id,
            created: {
              gte: moment(started_at, "YYYY-MM-DD hh:mm:ss").unix(),
              lte: moment(ended_at, "YYYY-MM-DD hh:mm:ss").unix()
            }
          },
          async (err, charges) => {
            res.json({
              clicks: getAdvertisersClicksFiltered,
              impressions: getAdvertisersImpressionsFiltered,
              conversions: getAdvertisersConversionFiltered,
              actionCount: {
                impressions: Number(getAdvertisersImpressionsFiltered.length),
                clicks: Number(getAdvertisersClicksFiltered.length),
                conversions: Number(getAdvertisersConversionFiltered.length)
              },
              browserCount: {
                chrome: chromeAnalyticsFiltered.length,
                safari: safariAnalyticsFiltered.length,
                edge: edgeAnalyticsFiltered.length,
                firefox: firefoxAnalyticsFiltered.length,
                other: otherAnalyticsFiltered.length
              },
              cities: citiesFiltered,
              growth: {
                clicks: clicksGrowthFiltered,
                impressions: impressionsGrowthFiltered,
                conversions: conversionsGrowthFiltered
              },
              offersRanking: offersRanking.sort((a, b) => b.ctr - a.ctr),
              devices,
              payments: err ? [] : charges.data,
              categories,
              stripeGrowth: await models.stripeGrowthAdvertisers(stripe_cust_id)
            });
          }
        );
      } else {
        const lastMonthsImpressions = await models.lastMonthAdvertiserAll(
          affiliate_id,
          "impression"
        );

        const thisMonthsImpressions = await models.thisMonthAdvertiserAll(
          affiliate_id,
          "impression"
        );

        const lastMonthClicks = await models.lastMonthAdvertiserAll(
          affiliate_id,
          "click"
        );

        const thisMonthClicks = await models.thisMonthAdvertiserAll(
          affiliate_id,
          "click"
        );

        const lastMonthConversions = await models.lastMonthAdvertiserAll(
          affiliate_id,
          "conversion"
        );

        const thisMonthConversions = await models.thisMonthAdvertiserAll(
          affiliate_id,
          "conversion"
        );

        const impressionsGrowth =
          ((thisMonthsImpressions.count - lastMonthsImpressions.count) /
            thisMonthsImpressions.count) *
          100;

        const clicksGrowth =
          ((thisMonthClicks.count - lastMonthClicks.count) /
            thisMonthClicks.count) *
          100;

        const conversionsGrowth =
          ((thisMonthConversions.count - lastMonthConversions.count) /
            thisMonthConversions.count) *
          100;

        const cities = await models.citiesFilteredByUser(affiliate_id);

        const devices = await models.deviceByUser(affiliate_id);

        const analyticsForAdvertisersClicks = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .andWhere("action", "click")
          .orderBy("an.id", "desc");

        const analyticsForAdvertisersImpressions = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .andWhere("action", "impression")
          .orderBy("an.id", "desc");

        const analyticsForAdvertisersConversions = await models
          .analyticsWithPricingAdvertiser(affiliate_id)
          .andWhere("action", "conversion")
          .orderBy("an.id", "desc");

        const chromeAnalytics = await models
          .browserCountAdvertisers("Chrome", affiliate_id)
          .orderBy("an.id", "desc");
        const safariAnalytics = await models
          .browserCountAdvertisers("Safari", affiliate_id)
          .orderBy("an.id", "desc");
        const edgeAnalytics = await models
          .browserCountAdvertisers("Edge", affiliate_id)
          .orderBy("an.id", "desc");
        const firefoxAnalytics = await models
          .browserCountAdvertisers("Firefox", affiliate_id)
          .orderBy("an.id", "desc");
        const otherAnalytics = await models
          .browserCountAdvertisers("Other", affiliate_id)
          .orderBy("an.id", "desc");

        await stripe.charges.list(
          {
            customer: stripe_cust_id
          },
          async (err, charges) => {
            res.json({
              clicks: analyticsForAdvertisersClicks,
              impressions: analyticsForAdvertisersImpressions,
              conversions: analyticsForAdvertisersConversions,
              actionCount: {
                impressions: Number(analyticsForAdvertisersImpressions.length),
                clicks: Number(analyticsForAdvertisersClicks.length),
                conversions: Number(analyticsForAdvertisersConversions.length)
              },
              browserCount: {
                chrome: chromeAnalytics.length,
                safari: safariAnalytics.length,
                edge: edgeAnalytics.length,
                firefox: firefoxAnalytics.length,
                other: otherAnalytics.length
              },
              cities: cities.rows,
              growth: {
                clicks: clicksGrowth,
                impressions: impressionsGrowth,
                conversions: conversionsGrowth
              },
              offersRanking: offersRanking.sort((a, b) => b.ctr - a.ctr),
              devices,
              payments: err ? [] : charges.data,
              categories,
              stripeGrowth: await models.stripeGrowthAdvertisers(stripe_cust_id)
            });
          }
        );
      }
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
