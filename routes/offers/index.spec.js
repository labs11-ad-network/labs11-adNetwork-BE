const request = require("supertest");
const server = require("../../api/server");
const db = require("../../data/dbConfig");

afterAll(() => {
  db("offers").truncate();
});

describe("Offer routes", () => {
  describe("GET routes", () => {
    it("should return 200 if successful", () => {
      return request(server)
        .get("/api/offers")
        .then(res => expect(res.status).toBe(200));
    });

    it("should return 404 if offer is not found", () => {
      return request(server)
        .get("/api/offers/98785")
        .then(res => expect(res.status).toBe(404));
    });

    it("should return 201 if offer is added successfully", () => {
      return request(server)
        .post("/api/offers")
        .send({
          budget: 20,
          name: "test",
          description: "testing123",
          category: "test",
          currency: "USD",
          status: "OFF"
        })
        .then(res => expect(res.status).toBe(201));
    });
  });
});
