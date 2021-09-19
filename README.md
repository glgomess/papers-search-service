# HCI Papers Search Backend

An application built using [React.js](https://pt-br.reactjs.org) and [Carbon Design System](https://www.carbondesignsystem.com) for searching HCI related papers from a specific set of papers. 

## Pre-requisites
In order for the application to work properly, a few things must be installed:
1. [Node.js](https://nodejs.org/en/)
2. [npm](https://www.npmjs.com) 

**NOTE: Usually npm comes installed with Node.js as the default package manager.**

## Installation

To install locally, you must follow these steps:
1. Clone the repository locally `$git clone <repo>`
2. Open the project folder via terminal, and run the command `$npm i` to install all the dependencies.
3. Create a file `.env` on the root folder, and fill it with the necessary variables.

**NOTE: All required environment variables are listed in the file** `env.sample`. **Their value may vary according to how you want to run the application.**

## Running the application
To run the application locally, just run the command `$npm run dev` on the root folder.

## ESLint
This project (and also the backend service) was coded with the following [guidelines](https://github.com/airbnb/javascript) provided by Airbnb.
These are coding standards to facilitate reusability and readability.

To make the most out of it, it is recommended to install a **formatter** to autommatically format files according to these standards.

For **VS Code** users, the ESLint extension is recommended. To enable it as the default formatter, simple go to **manage** and search for:
- Default Formatter -> change it to ESLint.
- Format on save -> 'tick' the checkbox.

Now it should format your code everytime a file is saved.

**NOTE: For Windows users, it is possible that the rule `linebreak-style` might not work correctly, in that case refer to the [official documentation](https://eslint.org/docs/rules/linebreak-style).**
## Project Structure
The project base structure consists of (may vary by route):

`Incoming HTTP Request` -> `CORs validation` -> `Auth. Middlewares` -> `Any other Middleware` -> `file.route.ts` -> `file.service.ts` -> `access DB` 


### Folder Structure

#### `/database` 
Contains two files:
- `postgres.ts`: a simple file to create a connection with the database.
- `queries.ts`: in this file, all the system queries are written.

#### `/errors` 
In this folder there are all the custom errors in the application, which are throw depending on the situation.

#### `/interfaces`
Here we have all the interfaces, which work as a 'model'. These interfaces are objects that follow a certain structure, for example:
- `new-user.interface` represents the data received when a request to create a new user is made. The **user model** is not utilized, since we don't have the **id property** at the moment of signup, so we create this interface to facilitate.
Basically, interfaces work as a model for specific situations. 

#### `/routes` 
Here we have all the application routes. Files are divided by their 'usecase', you can say. Auth routes will handle requests susch as **login, signup**.
Each route should **always** have a middleware to check the information sent for the client, to prevent possible security issues. 
Also, the only purpose of a route is to obtain the request information and call the **service** layer, to process all the business logic.

#### `/services` 
This is the **service layer**, which is responsible for processing all business logic. Each file here has a corresponding file on the **routes** folder, so the **auth.service.ts** has functions that are called by the **auth.route.ts**. This is not a strict rule, but that is usually what happens through the application.

#### `/utils` 
Here we have generic functions that are utilized throughout the application.
 

## Authentication
The authentication is made with JWT. Once the user has provided the credentials correctly, the system generates a JWT based on the secret key, on environment variables. 
Finally, this JWT is saved on the client (browser) via cookies, and is a HttpOnly cookie, which is not accessible by client code, preventing possible security issues.

## Routes
The documentation for all the routes was built using the Swagger Tool. The file for the documentations is located in `/src/swagger.json`.
If you're runnning locally, you can access it via [http://localhost:3001/api-docs](http://localhost:3001/api-docs).

The endpoint for accessing it is `/api-docs`, no matter the environtment you're trying to access.