# How to Generate OpenAPI Spec from an Express Backend

The OpenAPI specification is a standard guideline for describing and documenting APIs. An OpenAPI specification document can be either a JSON or YAML file.

## Generating OpenAPI

You can automatically generate an OpenAPI spec in JSON format for your Express backend.

Assume you have an Express backend with following set of routes:

```js
// src/routes/user.route.js

const { Router } = require("express");
const { createUser, deleteUser, getAllUsers, getUser, updateUser } = require("../controllers/user.controller");

const userRoute = () => {
  const router = Router();

  router.post("/users", createUser);

  router.get("/users", getAllUsers);

  router.get("/users/:id", getUser);

  router.patch("/users/:id", updateUser);

  router.delete("/users/:id", deleteUser);

  return router;
};

module.exports = { userRoute };
```

```js
// src/routes/book.route.js

const { Router } = require("express");
const { createBook, deleteBook, getAllBooks, getBook, updateBook } = require("../controllers/book.controller");

const bookRoute = () => {
  const router = Router();

  router.post("/books", createBook);

  router.get("/books", getAllBooks);

  router.get("/books/:id", getBook);

  router.put("/books/:id", updateBook);

  router.delete("/books/:id", deleteBook);

  return router;
};

module.exports = { bookRoute };
```

Install the following dependencies:

```bash
npm install swagger-autogen
npm install swagger-ui-express
```

In the root of your project, create a JSON file `swagger_output.json`. This file will contain the generated OpenAPI spec. Add some details about your server to the file in this format:

```json
 {
  info: {
    version: '',
    title: '',
    description: '',
  },
  host: '',
  basePath: '',
  schemes: [],
  consumes: [],
  produces: [],
  tags: [
    {
      name: 'Users'
    },
    {
    name: 'Books'
     }
  ],
  securityDefinitions: {},
  definitions: {},
  components: {}
};
```

The property `tags` represent a set of endpoints grouped together by their domain. The `Users` tag represent all the endpoints under the user routes.

In the root of your project, create a file `swagger.js` and add the following content to it:

```js
const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./src/routes/user.route.js", "./src/routes/book.route.js"];

swaggerAutogen(outputFile, endpointsFiles);
```

In the `swagger.js`, you import the swagger-autogen package that will handle generating the OpenAPI spec for your routes. The path to your routes and OpenAPI spec file are passed to the swagger-autogen function.

Update your `package.json` with a script to generate the OpenAPI spec for your project.

```json
// package.json

"scripts": {
    "swagger-autogen": "node swagger.js"
}
```

In your terminal, run `npm run swagger-autogen` to generate the OpenAPI spec. This command will update the `swagger_output.json` file that was previously created.

Update your index file by importing the `swagger-ui-express` package, the `swagger_output.json` file. Mount the swagger ui middleware on the path `/documentation`
. Your index file should look like this:

```js
// src/index.js

const express = require("express");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json");

const { connectToDatabase } = require("./databaseConnection");
const { bookRoute } = require("./routes/book.route");
const { userRoute } = require("./routes/user.route");

dotenv.config();

const HOST = process.env.HOST || "http://localhost";
const PORT = parseInt(process.env.PORT || "4500");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", bookRoute());
app.use("/", userRoute());
app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/", (req, res) => {
  return res.json({ message: "Hello World!🎉" });
});

app.listen(PORT, async () => {
  await connectToDatabase();

  console.log(`Application started on URL ${HOST}:${PORT} 🎉`);
});
```

You can view the generated documentation for your routes when you navigate to the path `/documentation`.
