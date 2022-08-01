const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

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

app.get("/statement/:cpf", (req, res) => {
  const { cpf } = req.params;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if(!customer) {
    return res.status(404).json({ message: "Customer not found"})
  }

  return res.status(200).json(customer.statement);
});

app.listen(3333);
