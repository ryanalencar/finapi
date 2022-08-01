const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

// Middlewares
function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).json({ message: "Customer not found" });
  }

  req.customer = customer;

  return next();
}

app.post("/account", (req, res) => {
  const { name, cpf } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return res.status(400).send({ message: "Customer already exists" });
  }

  const customer = {
    name,
    cpf,
    id: uuid(),
    statement: [],
  };

  customers.push(customer);

  return res
    .status(201)
    .json({ message: "Customer created successfully", customer });
});

app.get("/statement", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req
  return res.status(200).json(customer.statement);
});

app.listen(3333);
