const request = require("supertest");
const server = require("../../api/server");
const db = require("../../data/dbConfig");

afterAll(() => {
  return db("analytics").truncate();
});

describe("Analytics Routes", () => {
  it("should return 201 when new action is recorded", () => {
    return request(server)
      .post("/api/analytics")
      .send({
        action: "click",
        ip: "192.168.0.1",
        browser: "chrome",
        referrer: "netlify.com",
        agreement_id: 1
      })
      .then(res => expect(res.status).toBe(201));
  });

  it("should return 400 if it fails to add data", () => {
    return request(server)
      .post("/api/analytics")
      .send({
        action: "click",
        ip: "192.168.0.1",
        browser: "chrome",
        referrer: "netlify.com"
      })
      .then(res => expect(res.status).toBe(400));
  });
});
