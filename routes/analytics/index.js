const route = require("express").Router();
const models = require("../../common/helpers");
const db = require("../../data/dbConfig");
const { authenticate } = require("../../common/authentication");
const iplocation = require("iplocation").default;
const UAParser = require("ua-parser-js");

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
        const payments = await db("agreements as ag")
          .join("offers as o", "ag.offer_id", "o.id")
          .join("analytics as an", "ag.id", "an.agreement_id")
          .select(
            "ag.*",
            "o.user_id",
            "o.price_per_impression",
            "o.price_per_click",
            "an.*"
          );

        payments.map(async user => {
          const advertiser = await models.findBy("users", { id: user.user_id });
          const affiliate = await models.findBy("users", {
            id: user.affiliate_id
          });

          if (action === "impression") {
            // advertiser
            await models.update("users", user.user_id, {
              amount: advertiser.amount - user.price_per_impression
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

            // affiliate
            await models.update("users", user.affiliate_id, {
              amount: affiliate.amount + user.price_per_click
            });
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
  const { acct_type } = req.decoded;
  const { started_at, ended_at } = req.query;
  try {
    if (acct_type === "affiliate") {
      const offersRanking = await db("offers").map(async offer => {
        const offersClick = await db("offers as o")
          .join("agreements as ag", "ag.offer_id", offer.id)
          .join("analytics as an", "ag.id", "an.agreement_id")
          .select("o.*", "an.*")
          .groupBy("o.id", "an.id", "an.action")
          .where("action", "click");

        const offersImpression = await db("offers as o")
          .join("agreements as ag", "ag.offer_id", offer.id)
          .join("analytics as an", "ag.id", "an.agreement_id")
          .select("o.*", "an.*")
          .groupBy("o.id", "an.id", "an.action")
          .where("action", "impression");

        offer.ctr =
          Math.floor(
            (offersClick.length / offersImpression.length) * 100 * 100
          ) / 100 || 0;

        return offer;
      });

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

        const cities = await db("analytics as an")
          .join("agreements as ag", "ag.id", "an.agreement_id")
          .where("an.agreement_id", id)
          .select("city", "longitude", "latitude")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .count("* as num")
          .groupBy("city", "longitude", "latitude");

        const devices = await db("analytics as an")
          .select("device")
          .count("device")
          .from("analytics")
          .join("agreements as ag", "ag.id", "analytics.agreement_id")
          .where("ag.affiliate_id", user_id)
          .andWhere("ag.id", id)
          .andWhere("analytics.created_at", ">=", started_at)
          .andWhere("analytics.created_at", "<", ended_at)
          .groupBy("analytics.device");
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
          devices
        });
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

        const cities = await db.raw(
          `SELECT city, longitude, latitude,  count(*) as NUM FROM analytics JOIN agreements as ag ON ag.id = analytics.agreement_id WHERE ag.affiliate_id = ${user_id} AND ag.id = ${id} GROUP BY city, longitude, latitude`
        );

        const devices = await db("analytics as an")
          .select("device")
          .count("device")
          .from("analytics")
          .join("agreements as ag", "ag.id", "analytics.agreement_id")
          .where("ag.affiliate_id", user_id)
          .andWhere("ag.id", id)
          .groupBy("analytics.device");

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
          devices
        });
      }
    } else if (acct_type === "advertiser") {
      const offersRanking = await db("offers")
        .where({ user_id })
        .map(async offer => {
          const offersClick = await db("offers as o")
            .join("agreements as ag", "ag.offer_id", offer.id)
            .join("analytics as an", "ag.id", "an.agreement_id")
            .select("o.*", "an.*")
            .groupBy("o.id", "an.id", "an.action")
            .where("action", "click");

          const offersImpression = await db("offers as o")
            .join("agreements as ag", "ag.offer_id", offer.id)
            .join("analytics as an", "ag.id", "an.agreement_id")
            .select("o.*", "an.*")
            .groupBy("o.id", "an.id", "an.action")
            .where("action", "impression");

          offer.ctr =
            Math.floor(
              (offersClick.length / offersImpression.length) * 100 * 100
            ) / 100 || 0;

          return offer;
        });

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

        // const cities = await db.raw(
        //   `SELECT city, longitude, latitude,  count(*) as NUM FROM analytics JOIN agreements as ag ON ag.id = analytics.agreement_id JOIN offers as o ON ag.offer_id = o.id WHERE o.user_id = ${user_id} AND o.id = ${id} GROUP BY city, longitude, latitude`
        // );
        const cities = await db("analytics as an")
          .join("agreements as ag", "ag.id", "an.agreement_id")
          .join("offers as o", "ag.offer_id", "o.id")
          .where("o.user_id", user_id)
          .andWhere("o.id", id)
          .select("city", "longitude", "latitude")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .count("* as num")
          .groupBy("city", "longitude", "latitude");

        const devices = await db("analytics as an")
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
          devices
        });
      } else {
        const devices = await db("analytics as an")
          .select("device")
          .count("device")
          .from("analytics")
          .join("agreements as ag", "ag.id", "analytics.agreement_id")
          .join("offers as o", "o.id", "ag.offer_id")
          .where("o.user_id", user_id)
          .andWhere("o.id", id)
          .groupBy("analytics.device");

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

        const cities = await db.raw(
          `SELECT city, longitude, latitude,  count(*) as NUM FROM analytics JOIN agreements as ag ON ag.id = analytics.agreement_id JOIN offers as o ON ag.offer_id = o.id WHERE o.user_id = ${user_id} AND o.id = ${id} GROUP BY city, longitude, latitude`
        );
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
          devices
        });
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
  const { acct_type } = req.decoded;

  // // destructuring the query

  const { action, started_at, ended_at, agreement_id } = req.query;

  try {
    if (acct_type === "affiliate") {
      const offersRanking = await db("offers").map(async offer => {
        const offersClick = await db("offers as o")
          .join("agreements as ag", "ag.offer_id", offer.id)
          .join("analytics as an", "ag.id", "an.agreement_id")
          .select("o.*", "an.*")
          .groupBy("o.id", "an.id", "an.action")
          .where("action", "click");

        const offersImpression = await db("offers as o")
          .join("agreements as ag", "ag.offer_id", offer.id)
          .join("analytics as an", "ag.id", "an.agreement_id")
          .select("o.*", "an.*")
          .groupBy("o.id", "an.id", "an.action")
          .where("action", "impression");

        offer.ctr =
          Math.floor(
            (offersClick.length / offersImpression.length) * 100 * 100
          ) / 100 || 0;

        return offer;
      });

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

      const cities = await db("analytics as an")
        .join("agreements as ag", "ag.id", "an.agreement_id")
        .where("ag.affiliate_id", affiliate_id)
        .select("city", "longitude", "latitude")
        .count("* as num")
        .groupBy("city", "longitude", "latitude");

      if (action && started_at && ended_at) {
        const getActions = await models
          .analyticsWithPricing(affiliate_id)
          .where("an.created_at", ">=", started_at)
          .where("an.created_at", "<", ended_at)
          .andWhere("an.action", action);
        res.json(getActions);
      } else if (!action && started_at && ended_at) {
        const devices = await db("analytics as an")
          .select("device")
          .count("device")
          .from("analytics")
          .join("agreements as ag", "ag.id", "analytics.agreement_id")
          .where("ag.affiliate_id", affiliate_id)
          .andWhere("analytics.created_at", ">=", started_at)
          .andWhere("analytics.created_at", "<", ended_at)
          .groupBy("analytics.device");

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

        const citiesFiltered = await db("analytics as an")
          .join("agreements as ag", "ag.id", "an.agreement_id")
          .where("ag.affiliate_id", affiliate_id)
          .select("city", "longitude", "latitude")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .count("* as num")
          .groupBy("city", "longitude", "latitude");
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
          devices
        });
      } else if (!started_at && !ended_at && action) {
        const getActions = await models
          .analyticsWithPricing(affiliate_id)
          .where({ action });
        res.json(getActions);
      } else {
        const devices = await db("analytics as an")
          .select("device")
          .count("device")
          .from("analytics")
          .join("agreements as ag", "ag.id", "analytics.agreement_id")
          .where("ag.affiliate_id", affiliate_id)
          .groupBy("analytics.device");

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
          devices
        });
      }
    } else if (acct_type === "advertiser") {
      const offersRanking = await db("offers")
        .where({ user_id: affiliate_id })
        .map(async offer => {
          const offersClick = await db("offers as o")
            .join("agreements as ag", "ag.offer_id", offer.id)
            .join("analytics as an", "ag.id", "an.agreement_id")
            .select("o.*", "an.*")
            .groupBy("o.id", "an.id", "an.action")
            .where("action", "click");

          const offersImpression = await db("offers as o")
            .join("agreements as ag", "ag.offer_id", offer.id)
            .join("analytics as an", "ag.id", "an.agreement_id")
            .select("o.*", "an.*")
            .groupBy("o.id", "an.id", "an.action")
            .where("action", "impression");

          offer.ctr =
            Math.floor(
              (offersClick.length / offersImpression.length) * 100 * 100
            ) / 100 || 0;

          return offer;
        });

      if (started_at && ended_at) {
        const devices = await db("analytics as an")
          .select("device")
          .count("device")
          .from("analytics")
          .join("agreements as ag", "ag.id", "analytics.agreement_id")
          .join("offers as o", "o.id", "ag.offer_id")
          .where("o.user_id", affiliate_id)
          .where("analytics.created_at", ">=", started_at)
          .andWhere("analytics.created_at", "<", ended_at)
          .groupBy("analytics.device");

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

        const citiesFiltered = await db("analytics as an")
          .join("agreements as ag", "ag.id", "an.agreement_id")
          .join("offers as o", "ag.offer_id", "o.id")
          .where("o.user_id", affiliate_id)
          .select("city", "longitude", "latitude")
          .where("an.created_at", ">=", started_at)
          .andWhere("an.created_at", "<", ended_at)
          .count("* as num")
          .groupBy("city", "longitude", "latitude");
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
          devices
        });
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
        const cities = await db.raw(
          `SELECT city, longitude, latitude,  count(*) as NUM FROM analytics JOIN agreements as ag ON ag.id = analytics.agreement_id JOIN offers as o ON ag.offer_id = o.id WHERE o.user_id = ${affiliate_id} GROUP BY city, longitude, latitude`
        );
        const devices = await db("analytics as an")
          .select("device")
          .count("device")
          .from("analytics")
          .join("agreements as ag", "ag.id", "analytics.agreement_id")
          .join("offers as o", "o.id", "ag.offer_id")
          .where("o.user_id", affiliate_id)
          .groupBy("analytics.device");

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
          devices
        });
      }
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
