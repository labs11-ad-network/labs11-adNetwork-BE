const request = require("supertest");
const server = require("../../api/server");
const db = require("../../data/dbConfig");

beforeAll(() => {
  return db("agreements").truncate();
});

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
    describe("Agreement POST route", () => {
      it("should return 201 if the agreement is added successfully", () => {
        return request(server)
          .post("/api/agreements")
          .send({
            offer_id: 1,
            affiliate_id: 1,
            advertiser_id: 3
          })
          .then(res => expect(res.status).toBe(201));
      });
    });
  });
});
