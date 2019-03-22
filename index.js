require("dotenv").config();

const server = require("./api/server");
// 404
server.use(function (req, res, next) {
  return res
    .status(404)
    .send({ message: "[Route] --> " + req.url + " <-- Not found." });
});
// 500 - Any server error
server.use(function (err, req, res, next) {
  return res.status(500).json({ error: err });
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`🔥 -------- listening on port ${port} ---------- 🔥`));
