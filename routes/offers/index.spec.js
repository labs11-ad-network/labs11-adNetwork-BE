const request = require("supertest");
const server = require("../../api/server");
const db = require("../../data/dbConfig");

afterAll(() => {
  db("offers").truncate();
});

describe("Offer routes", () => {
  describe("Offer CRUD routes", () => {
    describe("Offer GET routes", () => {
      it("should return 200 if successful", () => {
        return request(server)
          .get("/api/offers")
          .then(res => expect(res.status).toBe(200));
      })

      it("should return 404 if offer is not found", () => {
        return request(server)
          .get("/api/offers/98785")
          .then(res => expect(res.status).toBe(404));
      })

      it("should return 500 as a general error", () => {
        return request(server)
          .get('/api/offerss')
          .then(res => expect(res.status).toBe(500))
      })
    })

    describe("Offer POST routes", () => {
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
      })

        it("should return 500 if the post is empty", () => {
          return request(server)
            .post("/api/offers/")
            .send({})
            .then(res => expect(res.status).toBe(500))
        })
    })

    describe("Offer PUT routes", () => {
      it("should return 200 if offer is successfully edited", () => {
        return request(server)
          .put("/api/offers/100")
          .send({
            name: "Winstonville Country Club",
            budget: 20000000
          })
          .then(res => expect(res.status).toBe(200))
      })

      it("should return 500 if the offer is empty", () => {
        return request(server)
          .put("api/offers/100")
          .send({})
          .then(res => expect(res.status).toBe(500))
      })
    })

    describe("Offer DELETE routes", () => {
      it("should return 200 if offer is successfully deleted", () => {
        return request(server)
          .delete("/api/offers/100")
          .then(res => expect(res.status).toBe(200))
      })

      it("should return 500 if the ID is invalid", () => {
        return request(server)
          .delete("/api/offers/1000")
          .then(res => expect(res.status).toBe(500))
      })
    })

  });
});
