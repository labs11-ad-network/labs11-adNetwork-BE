const route = require("express").Router();
const models = require("../../common/helpers");
const db = require("../../data/dbConfig");
const { authenticate } = require('../../common/authentication')

route.post("/", async (req, res) => {
  const { action, browser, ip, referrer, agreement_id } = req.body;

  try {
    const [enterAction] = await models.add("analytics", {
      action,
      browser,
      ip,
      referrer,
      agreement_id
    });
    if (!enterAction)
      return res.status(400).json({ message: "Failed to add action" });
    const analytics = await models.findBy("analytics", { id: enterAction });
    res.json(analytics);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.decoded.id;
  const { acct_type } = req.decoded;

  try {
    if (acct_type === "affiliate") {
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
        }
      });
    } else if (acct_type === "advertiser") {
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
        }
      });
    }
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.get("/", authenticate, async (req, res) => {

  // Current logged in user
  const affiliate_id = req.decoded.id
  const { acct_type } = req.decoded

  // // destructuring the query

  const { action, started_at, ended_at, agreement_id } = req.query;

  try {

    if (acct_type === 'affiliate') {
      if (action && started_at && ended_at) {
        const getActions = await models.analyticsWithPricing(affiliate_id)
          .where("created_at", ">=", started_at)
          .where("created_at", "<", ended_at);
        res.json(getActions);
      } else if (!action && started_at && ended_at) {
        const getActions = await models.analyticsWithPricing(affiliate_id)
          .where("created_at", ">=", started_at)
          .where("created_at", "<", ended_at);
        res.json(getActions);
      } else if (!started_at && !ended_at && action) {
        const getActions = await models.analyticsWithPricing(affiliate_id).where({ action });
        res.json(getActions);
      } else {

        // all analytics that match the logged in user
        const analytics = await models.analyticsWithPricing(affiliate_id)
        res.json(analytics);
      }
    } else if (acct_type === 'advertiser') {
      const analyticsForAdvertisers = await models.analyticsWithPricingAdvertiser(affiliate_id)
      res.json(analyticsForAdvertisers)
    }

  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

module.exports = route;
