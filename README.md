 # 🔥 labs11-adNetwork-BE 🔥

##### Backend URL : https://lad-network.herokuapp.com

### Project Management
- [TrelloV1](https://trello.com/b/QyrA6PgD/labs11-non-creepy-ad-network) 🌍
- [TrelloV2](https://trello.com/b/cXZ3clQ7/lad-network) 🌍


## Table of Contents
 - [Summary Table of API Endpoints](#summary-table-of-api-endpoints)
   - [Register](#register-schema)
   - [️DB Schema](#️db-schema)



### Summary Table of API Endpoints
| Type   | Endpoints            | Description   |
| ------ | -------------------- | ------------- |
| POST   | /api/auth/registerV2 | Register User |
| GET    | /api/offers          | Register User |
| GET    | /api/offers/:id      | Register User |
| POST   | /api/offers          | Register User |
| PUT    | /api/offers/:id      | Register User |
| DELETE | /api/offers/:id      | Register User |



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


#### ️DB Schema
![](assets/dbSchema.png)



### Authors 
- John Benedict Miranda [Github](https://github.com/john2796) , [linkedin](https://www.linkedin.com/in/john-benedict-miranda-7b2357180/)
- Hamza Elkhoudiri [Github](https://github.com/elkhoudh) , [linkedin](https://www.linkedin.com/in/hamza-elkhoudiri-a606aa162/)
- Max McFerren [Github](https://github.com/mcferrenm) , [linkedin](https://www.linkedin.com/in/max-mcferren-423b75115/)
- Kieran Vieira [Github](https://github.com/KieranVieira) , [linkedin](https://www.linkedin.com/in/kieran-vieira/)
- Jordan Marsaw [Github](https://github.com/blokboy) 


