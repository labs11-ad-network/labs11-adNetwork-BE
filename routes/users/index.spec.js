const request = require("supertest");
const server = require("../../api/server");
const db = require("../../data/dbConfig");

beforeAll(() => {
  return db("users").truncate();
});

describe("Users route", () => {
  describe("Registration", () => {
    it("should return 422 if the request in incomplete", () => {
      return request(server)
        .post("/api/users/register")
        .send({})
        .then(res => expect(res.status).toBe(422));
    });

    it("should return 201 if the request succeeds", () => {
      return request(server)
        .post("/api/users/register")
        .send({
          first_name: "Hamza",
          last_name: "Elkhoudiri",
          email: "123@gmail.com",
          password: "elkhoudiri",
          phone: "9195000265",
          acct_type: "admin"
        })
        .then(res => expect(res.status).toBe(201));
    });

    it("should return 409 if user already exists", () => {
      return request(server)
        .post("/api/users/register")
        .send({
          first_name: "Hamza",
          last_name: "Elkhoudiri",
          email: "123@gmail.com",
          password: "elkhoudiri",
          phone: "9195000265",
          acct_type: "admin"
        })
        .then(res => expect(res.status).toBe(409));
    });
  });

  describe("Login", () => {
    it("should return 422 if request data is incomplete", () => {
      return request(server)
        .post("/api/users/login")
        .send({})
        .then(res => expect(res.status).toBe(422));
    });

    it("should return 200 if the request succeeds", () => {
      return request(server)
        .post("/api/users/login")
        .send({
          email: "123@gmail.com",
          password: "elkhoudiri"
        })
        .then(res => expect(res.status).toBe(200));
    });

    it("should return 404 if the user does not exist", () => {
      return request(server)
        .post("/api/users/login")
        .send({ email: "159@gmail.com", password: "86485" })
        .then(res => expect(res.status).toBe(404));
    });

    it("should return 401 if invalid credentials", () => {
      return request(server)
        .post("/api/users/login")
        .send({ email: "123@gmail.com", password: "86485" })
        .then(res => expect(res.status).toBe(401));
    });
  });
});
