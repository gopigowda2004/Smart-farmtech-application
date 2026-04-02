# 🌾 FarmTech Application

## 📌 Project Overview

FarmTech is a smart agriculture platform that connects farmers to rent and lease agricultural equipment among themselves. It helps reduce the high cost of owning machinery by enabling farmers to share resources efficiently.

---

## 🚀 Features

* 👨‍🌾 Farmer-to-Farmer Equipment Sharing
* 🔍 Browse and search available equipment
* 📅 Rent and lease machinery easily
* 🔐 Secure user authentication
* 📊 Manage listings and bookings

---

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Backend:** Spring Boot (Java)
* **Database:** MySQL
* **Server:** Apache Tomcat

---

## ⚙️ Project Setup Guide

### 📌 Prerequisites

Make sure you have installed:

* Node.js
* Java (JDK 8 or above)
* MySQL
* Git

---

### 🔧 Backend Setup (Spring Boot)

1. Clone the repository:

   ```bash
   git clone https://github.com/gopigowda2004/Smart-farmtech-application.git
   ```

2. Navigate to backend folder:

   ```bash
   cd backend
   ```

3. Configure MySQL database:

   * Create a database (e.g., `farmtech`)
   * Update `application.properties`:

   ```
   spring.datasource.url=jdbc:mysql://localhost:3306/farmtech
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

4. Run the Spring Boot application:

   ```bash
   mvn spring-boot:run
   ```

---

### 💻 Frontend Setup (React)

1. Navigate to frontend folder:

   ```bash
   cd farmer-rental-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the React app:

   ```bash
   npm start
   ```

4. Open browser:

   ```
   http://localhost:3000
   ```

   
🗄️ Database Setup (MySQL)
Open MySQL (Command Line / MySQL Workbench)
Login to MySQL:
mysql -u root -p
Create a new database:
CREATE DATABASE farmtech;
Use the database:
USE farmtech;
(Optional) Create tables manually or let Spring Boot auto-create tables using JPA/Hibernate.
⚙️ Update application.properties

Make sure your Spring Boot configuration matches your database:

spring.datasource.url=jdbc:mysql://localhost:3306/farmtech
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
---

## ⚙️ How It Works

1. Farmers register and log in
2. Equipment owners list their machinery
3. Other farmers browse and rent equipment
4. System manages bookings and leasing

---

## 💡 Problem Solved

Farmers often cannot afford expensive agricultural equipment. This platform allows them to share and rent machinery, reducing costs and improving efficiency.


## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
