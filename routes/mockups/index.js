const route = require("express").Router();
const models = require("../../common/helpers");
const { authenticate } = require("../../common/authentication");

const cloudinary = require("cloudinary");
const multipart = require("connect-multiparty")();

//console.log(process.env.CD_KEY, process.env.CD_SECRET)
cloudinary.config({
  cloud_name: "lambda-school",
  api_key: process.env.CD_KEY,
  api_secret: process.env.CD_SECRET
})
console.log()




route.get("/", authenticate, async (req, res) => {
  try {
    const ads = await models.get("ads");
    res.json(ads);
  } catch (error) {
    res.status(500).json(error);
  }
});

// @route    GET /api/ads
// @desc     post ads
// @Access   Private
// route.post("/", authenticate, multipart, async (req, res) => {
//   const user_id = req.decoded.id;
//   // try {
//   //   const [newAd] = await models.add("ads", { ...req.body, user_id });
//   //   if (!newAd) return res.status(500).json({ message: "Failed to add ad" });
//   //   const ad = await models.findBy("ads", { id: newAd });
//   //   res.json(ad);
//   // } catch ({ message }) {
//   //   res.status(500).json({ message });
//   // }
//   console.log('req.files', req.files);
//   cloudinary.v2.uploader.upload(req.files, async function (
//     error,
//     result
//   ) {
//     if (error) {
//       res.status(500).json({ message: "Upload failed" });
//     } else {
//       try {
//         res.json({ result })

//       } catch ({ message }) {
//         res.status(500).json({ message });
//       }
//     }
//   });
// });

// @route    GET api/ads/upload
// @desc     testing upload 
// @Access   Public
route.post('/upload', multipart, async (req, res) => {
  try {
    let filename = req.files.dataFile.path;
    console.log("--------------- filename ---------------", filename)
    res.send('test')


  } catch (err) {
    res.status(500).json(err)
  }
})





route.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.decoded.id;
  try {
    const adCheck = await models.findBy("ads", { id, user_id });

    if (!adCheck.length)
      return res
        .status(401)
        .json({ message: "You can not delete someone else's ad" });

    const deleteAd = await models.remove("ads", id);
    if (!deleteAd)
      return res.status(400).json({ message: "Failed to delete ad" });
    res.json({ success: true, id });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.get("/myads", authenticate, async (req, res) => {
  const user_id = req.decoded.id;

  try {
    const myAds = await models.findAllBy("ads", { user_id });
    res.json(myAds);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

route.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const ad = await models.findBy("ads", { id });
    if (!ad) return res.status(404).json({ message: "No ads found" });
    res.json(ad);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = route;
