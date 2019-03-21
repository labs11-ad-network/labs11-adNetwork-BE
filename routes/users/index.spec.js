const request = require("supertest")
const server = require("../../api/server")
const db = require("../../data/dbConfig")

beforeAll(() => {
  return db('users').truncate()
})

describe("Users CRUD routes", () => {
  describe("User Updates", () => {
    it("should return 204 if no body provided for update", () => {
      return request(server)
        .put("/api/users/4")
        .send({})
        .then(res => expect(res.status).toBe(204))
    })

    it("should return 200 if the user is successfully updated", () => {
      return request(server)
        .put("/api/users/3")
        .send({
          first_name: 'Blokboy'
        })
        .then(res => expect(res.status).toBe(200))
    })

    it("should return 404 if there is no ID provided", () => {
      return request(server)
        .put("/api/users/1000")
        .send({
          first_name: 'No User Here.'
        })
        .then(res => expect(res.status).toBe(404))
    })
  })

  describe("User Retrieval", () => {
    it("should return 404 if no user found at that ID", () => {
      return request(server)
        .get("/api/users/10000")
        .then(res => expect(res.status).toBe(404))
    })

    it("should return 200 if the user list is found", () => {
      return request(server)
        .get("/api/users/")
        .then(res => expect(res.status).toBe(200))
    })

    it("should return 200 if a specific user is found", () => {
      return request(server)
        .get("/api/users/3")
        .then(res => expect(res.status).toBe(200))
    })

    it("should return 404 if unable to retrieve the user list", () => {
      return request(server)
        .get("/api/userss/")
        .then(res => expect(res.status).toBe(404))
    })

  })

  describe("User Deletion", () => {
    it("should return 404 if no user found at that ID", () => {
      return request(server)
        .delete("/api/users/0")
        .then(res => expect(res.status).toBe(404))
    })

    it("should return 200 if the user is successfully deleted", () => {
      return request(server)
        .delete("api/users/1")
        .then(res => expect(res.status).toBe(200))
    })
  })
})
