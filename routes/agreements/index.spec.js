const request = require("supertest");
const server = require("../../api/server");
const db = require("../../data/dbConfig");

describe("Agreement routes", () => {
  describe("Agreement CRUD routes", () => {
    describe("Agreement GET routes", () => {
      it("should return 200 if the request succeeds", () => {
        return request(server)
          .get("/api/agreements")
          .then(res => expect(res.status).toBe(200));
      });
      it("should return 404 if agreement is not found", () => {
        return request(server)
          .get("/api/agreements/0981238")
          .then(res => expect(res.status).toBe(404));
      });
    });
  });
});
