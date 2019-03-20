const request = require("supertest");
const server = require("../../api/server");
const db = require("../../data/dbConfig");

afterAll(() => {
  db("ads").truncate();
});

describe("ads routes", () => {
  describe("GET routes", () => {
    it("should return 200 if successful", () => {
      return request(server)
        .get("/api/ads")
        .then(res => expect(res.status).toBe(200));
    });
  });
});
