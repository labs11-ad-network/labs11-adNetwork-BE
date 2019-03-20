const request = require("supertest");
const server = require("../../api/server");
const db = require("../../data/dbConfig");

describe('Agreements route', () => {
  it('should return 200 if the request succeeds', () => {
    return request(server)
      .get("/api/agreements")
      .then(res => expect(res.status).toBe(200));
  });
});