# FarmTech - Farmer Equipment Rental Application
This peer-to-peer equipment rental approach ensures **efficient use of resources** and reduces costs for farmers.

---

## Technologies Used
- **Frontend:** React.js
- **Backend:** Java Spring Boot
- **Database:** MySQL
- **Server:** Apache Tomcat
- **Version Control:** Git & GitHub

---

## Features
1. **User Registration & Login:** Farmers can create accounts and log in securely.
2. **Equipment Management:** Add, edit, and view available equipment.
3. **Peer-to-Peer Rental:** Connect and rent equipment directly from other farmers.
4. **Search & Filter:** Easily find equipment based on type, location, and availability.

---

## How to Run
1. **Backend (Spring Boot)**
   - Navigate to `backend/`
   - Build the project using Maven:
     ```bash
     mvn clean install
     ```
   - Run the application:
     ```bash
     mvn spring-boot:run
     ```

2. **Frontend (React)**
   - Navigate to `farmer-rental-app/`
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the application:
     ```bash
     npm start
     ```

3. Make sure **MySQL** is running and update the `application.properties` file with your database credentials.
**Create Database in MySQL**
CREATE DATABASE FarmTech;
---

## Run with Docker

- **Prerequisite**: Install Docker Desktop and ensure it is running.

### Quick start
1. From the project root, start all services:
   ```powershell
   Set-Location "c:\Users\gopig\OneDrive\Documents\34\FarmTech"; docker compose up --build
   ```
2. Open the apps:
   - **Frontend**: http://localhost:3000
   - **Backend**: http://localhost:8080
   - **MySQL**: localhost:3306 (Database: `FarmTech`, User: `root`, Password: `root`)

### What’s included
- **MySQL 8** initialized with database `FarmTech`.
- **Spring Boot backend** (Java 17) connecting to MySQL via service name `mysql`.
- **React frontend** served by Nginx; requests to `/api` are proxied to the backend.

### Configuration notes
- Backend datasource is set by environment variables in `docker-compose.yml`:
  - `SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/FarmTech`
  - `SPRING_DATASOURCE_USERNAME=root`, `SPRING_DATASOURCE_PASSWORD=root`
- Frontend builds with optional `REACT_APP_API_BASE_URL` (defaults to `/api`), so no change is needed for Docker runs.

### Useful commands
- Stop all containers:
  ```powershell
  docker compose down
  ```
- Rebuild images without cache:
  ```powershell
  docker compose build --no-cache
  ```
- Tail backend logs:
  ```powershell
  docker compose logs -f backend
  ```

## Contribution
Feel free to fork this repository and contribute to improving the platform. Suggestions for additional features like **notifications, payment integration, and real-time availability tracking** are welcome.

---

## Contact
- **Developer:** Gopi Gowda  
- **Email:** gopigowda132@gmail.com







images


![WhatsApp Image 2025-09-07 at 09 10 28_3c394abe](https://github.com/user-attachments/assets/c4faa31a-fb19-4a01-bc9e-d64291d1cd0b)



![WhatsApp Image 2025-09-07 at 09 10 28_c93867b9](https://github.com/user-attachments/assets/4d12f6cc-04be-4647-bf7b-7b021be25acf)




![WhatsApp Image 2025-09-07 at 09 10 29_5e2980ff](https://github.com/user-attachments/assets/806a1377-2c2d-409f-9e5d-b2e2f4a27146)


![WhatsApp Image 2025-09-07 at 09 10 29_c7ddf7f9](https://github.com/user-attachments/assets/1ed4433a-e865-4a68-9a18-eea1a4d9462a)





![WhatsApp Image 2025-09-07 at 09 10 29_96132716](https://github.com/user-attachments/assets/0fc6c00c-162d-4931-bdac-2aa869d1809e)





![WhatsApp Image 2025-09-07 at 09 10 30_eb317937](https://github.com/user-attachments/assets/f172aff5-edce-4208-aba1-bf4273ab7fac)
