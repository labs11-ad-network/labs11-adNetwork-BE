const route = require("express").Router();
const models = require("../../common/helpers");
const db = require("../../data/dbConfig");
const { authenticate } = require("../../common/authentication");
const iplocation = require("iplocation").default;

// @route    /api/analytics
// @desc     POST analytics
// @Access   Public
route.post("/", async (req, res) => {
  const { action, browser, ip, referrer, agreement_id } = req.body;
  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    iplocation(ipAddr, [], async (error, location) => {
      const [enterAction] = await models.add("analytics", {
        action,
        browser,
        ip: ipAddr,
        referrer,
        agreement_id,
        country: location.country,
        region: location.region,
        city: location.city,
        postal: location.postal,
        latitude: location.latitude,
        longitude: location.longitude
      });
      if (!enterAction)
        return res.status(400).json({ message: "Failed to add action" });

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
      const analytics = await models.findBy("analytics", { id: enterAction });
      res.json(analytics);
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

  try {
    if (acct_type === "affiliate") {
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

      // send the id of an agreeement and get the analytics for that agreement formatter like below
      const affiliateAnalyticsClicks = await models.analyticsPerOfferWithPricing(
        "click",
        user_id,
        id
      );
      const affiliateAnalyticsImpressions = await models.analyticsPerOfferWithPricing(
        "impression",
        user_id,
        id
      );
      const affiliateAnalyticsConversions = await models.analyticsPerOfferWithPricing(
        "conversion",
        user_id,
        id
      );

      const chromeCount = await models.browserCountPerOfferAffiliates(
        "Chrome",
        user_id,
        id
      );
      const safariCount = await models.browserCountPerOfferAffiliates(
        "Safari",
        user_id,
        id
      );
      const firefoxCount = await models.browserCountPerOfferAffiliates(
        "Firefox",
        user_id,
        id
      );
      const edgeCount = await models.browserCountPerOfferAffiliates(
        "Edge",
        user_id,
        id
      );
      const otherCount = await models.browserCountPerOfferAffiliates(
        "Other",
        user_id,
        id
      );

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
        }
      });
    } else if (acct_type === "advertiser") {
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
      const advertiserAnalyticsClicks = await models.analyticsPerOfferAdvertisers(
        "click",
        user_id,
        id
      );
      const advertiserAnalyticsImpressions = await models.analyticsPerOfferAdvertisers(
        "impression",
        user_id,
        id
      );
      const advertiserAnalyticsConversions = await models.analyticsPerOfferAdvertisers(
        "conversion",
        user_id,
        id
      );

      const chromeCount = await models.analyticsPerOfferAdvertisersBrowsers(
        "Chrome",
        user_id,
        id
      );
      const safariCount = await models.analyticsPerOfferAdvertisersBrowsers(
        "Safari",
        user_id,
        id
      );
      const firefoxCount = await models.analyticsPerOfferAdvertisersBrowsers(
        "Firefox",
        user_id,
        id
      );
      const edgeCount = await models.analyticsPerOfferAdvertisersBrowsers(
        "Edge",
        user_id,
        id
      );
      const otherCount = await models.analyticsPerOfferAdvertisersBrowsers(
        "Other",
        user_id,
        id
      );

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
        }
      });
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
      const cities = await db.raw(
        `SELECT city, longitude, latitude,  count(*) as NUM FROM analytics JOIN agreements as ag ON ag.id = analytics.agreement_id WHERE ag.affiliate_id = ${affiliate_id} GROUP BY city, longitude, latitude`
      );
      if (action && started_at && ended_at) {
        const getActions = await models
          .analyticsWithPricing(affiliate_id)
          .where("created_at", ">=", started_at)
          .where("created_at", "<", ended_at)
          .andWhere("action", action);
        res.json(getActions);
      } else if (!action && started_at && ended_at) {
        const getActions = await models
          .analyticsWithPricing(affiliate_id)
          .where("created_at", ">=", started_at)
          .where("created_at", "<", ended_at);
        res.json(getActions);
      } else if (!started_at && !ended_at && action) {
        const getActions = await models
          .analyticsWithPricing(affiliate_id)
          .where({ action });
        res.json(getActions);
      } else {
        // all analytics that match the logged in user

        const getAffiliateClicks = await models
          .analyticsWithPricing(affiliate_id)
          .where("action", "click");

        const getAffiliateImpressions = await models
          .analyticsWithPricing(affiliate_id)
          .where("action", "impression");

        const getAffiliateConversion = await models
          .analyticsWithPricing(affiliate_id)
          .where("action", "conversion");

        const chromeAnalytics = await await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Chrome");
        const safariAnalytics = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Safari");
        const edgeAnalytics = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Edge");
        const firefoxAnalytics = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Firefox");
        const otherAnalytics = await models
          .analyticsWithPricing(affiliate_id)
          .where("browser", "Other");

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
          cities: cities.rows,
          growth: {
            clicks: clicksGrowth,
            impressions: impressionsGrowth,
            conversions: conversionsGrowth
          }
        });
      }
    } else if (acct_type === "advertiser") {
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
      const analyticsForAdvertisersClicks = await models
        .analyticsWithPricingAdvertiser(affiliate_id)
        .andWhere("action", "click");

      const analyticsForAdvertisersImpressions = await models
        .analyticsWithPricingAdvertiser(affiliate_id)
        .andWhere("action", "impression");

      const analyticsForAdvertisersConversions = await models
        .analyticsWithPricingAdvertiser(affiliate_id)
        .andWhere("action", "conversion");

      const chromeAnalytics = await models.browserCountAdvertisers(
        "Chrome",
        affiliate_id
      );
      const safariAnalytics = await models.browserCountAdvertisers(
        "Safari",
        affiliate_id
      );
      const edgeAnalytics = await models.browserCountAdvertisers(
        "Edge",
        affiliate_id
      );
      const firefoxAnalytics = await models.browserCountAdvertisers(
        "Firefox",
        affiliate_id
      );
      const otherAnalytics = await models.browserCountAdvertisers(
        "Other",
        affiliate_id
      );

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
        }
      });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
