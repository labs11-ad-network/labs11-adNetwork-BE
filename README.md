 # 🔥 labs11-adNetwork-BE 🔥

##### Backend URL : https://lad-network.herokuapp.com

### Project Management
- [TrelloV1](https://trello.com/b/QyrA6PgD/labs11-non-creepy-ad-network) 🌍
- [TrelloV2](https://trello.com/b/cXZ3clQ7/lad-network) 🌍


## Table of Contents
 - [Summary Table of API Endpoints](#summary-table-of-api-endpoints)
   - [Register](#register-schema)
   - [️DB Schema](#️db-schema)
   - [️Users](#users)
   - [Offers](#offers)



### Summary Table of API Endpoints
| Type   | Endpoints            | Description      |
| ------ | -------------------- | ---------------- |
| POST   | /api/auth/registerV2 | Register User    |
| GET    | /api/api/users       | Get User Info    |
| GET    | /api/api/users/:id   | Get User by Id   |
| PUT    | /api/api/users/:id   | Update User      |
| DELETE | /api/api/users/:id   | Delete User      |
| GET    | /api/offers          | Get offers       |
| GET    | /api/offers/:id      | Get offers by id |
| POST   | /api/offers          | Add offers       |
| PUT    | /api/offers/:id      | Update Offer     |
| DELETE | /api/offers/:id      | Delete Offer     |



#### Register schema
```
{
  id: 1,                                                 // integer unique
  name: 'lad',                                           // string
  email: 'lad@gmail.com',                                // string
  image_url: 'https://via.placeholder.com',              // string
  nickname: 'ladzz',                                     // string
  sub: "google-oauth2|1141223585512312",                 // string
  acct_type: 'admin',                                    // string
  phone: '6191230543',                                   // string
  stripe_cust_id: '12',                                  // string
}
```
#### Register and Login Options
![](assets/loginoptions.png)



#### Users
`GET 200 success ✅`
```
{
    "id": 2,
    "name": "Lad Network",
    "email": "LadNetwork@live.com",
    "image_url": "https://avatars0.githubusercontent.com/u/123323?v=4",
    "nickname": "Lad",
    "sub": "github|12533103",
    "acct_type": "affiliate",
    "phone": null,
    "stripe_cust_id": null
}
```
#### Offers 
`GET 200 success ✅`
```
  [
    {
        "id": 1,
        "price_per_click": 0.05,
        "price_per_impression": 0.001,
        "num_applicants": 0,
        "budget": 56000,
        "name": "Bananas",
        "description": "The best bananas in town",
        "category": "Health + Wellness",
        "currency": "USD",
        "status": true,
        "user_id": 1,
        "created_at": "2019-03-26T16:47:19.087Z",
        "updated_at": "2019-03-26T16:47:19.087Z"
    }
  ]
```
`500 error ❌ `
```
  {
    "message": {
        "message": "Invalid token specified: Unexpected token \u0007 in JSON at position 278"
    }
}
```
#### Private Route middleware
`500 error ❌`
```
{
    "message": "You need to passed Headers !"
}
```

#### ️DB Schema
![](assets/dbSchema.png)



### Authors 
- John Benedict Miranda [Github](https://github.com/john2796) , [linkedin](https://www.linkedin.com/in/john-benedict-miranda-7b2357180/)
- Hamza Elkhoudiri [Github](https://github.com/elkhoudh) , [linkedin](https://www.linkedin.com/in/hamza-elkhoudiri-a606aa162/)
- Max McFerren [Github](https://github.com/mcferrenm) , [linkedin](https://www.linkedin.com/in/max-mcferren-423b75115/)
- Kieran Vieira [Github](https://github.com/KieranVieira) , [linkedin](https://www.linkedin.com/in/kieran-vieira/)
- Jordan Marsaw [Github](https://github.com/blokboy) 


