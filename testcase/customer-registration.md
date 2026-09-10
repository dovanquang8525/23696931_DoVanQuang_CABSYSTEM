| ID   | API                              | Test Scenario                                               | Expected Result                 | Type     |
| ---- | -------------------------------- | ----------------------------------------------------------- | ------------------------------- | -------- |
| TS01 | GET `/customers`                 | Get customer list when customers exist                      | Return customer list            | Positive |
| TS02 | GET `/customers`                 | Get customer list when no customer exists                   | Return empty list               | Boundary |
| TS03 | POST `/customers`                | Register with valid name, email, phone and password         | Account is created              | Positive |
| TS04 | POST `/customers`                | Register with invalid email or missing required information | Return `400`                    | Negative |
| TS05 | POST `/customers`                | Register with an email or phone already used                | Return `409`                    | Negative |
| TS06 | GET `/customers/{customerId}`    | Get an existing customer                                    | Return customer information     | Positive |
| TS07 | GET `/customers/{customerId}`    | Get a non-existing customer ID                              | Return `404`                    | Negative |
| TS08 | PUT `/customers/{customerId}`    | Update customer with valid information                      | Customer information is updated | Positive |
| TS09 | PUT `/customers/{customerId}`    | Update customer with invalid email                          | Return `400`                    | Negative |
| TS10 | DELETE `/customers/{customerId}` | Delete an existing customer                                 | Customer is deleted             | Positive |
| TS11 | DELETE `/customers/{customerId}` | Delete a non-existing customer                              | Return `404`                    | Negative |
