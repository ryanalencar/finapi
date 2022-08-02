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

function getCustomerBalance(statement) {
  const balance = statement.reduce((acc, _statement) => {
    if (_statement.type === "credit") return acc + _statement.amount;
    return acc - _statement.amount;
  }, 0);

  return balance;
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

app.use(verifyIfExistsAccountCPF);

app.get("/statement", (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  let statement = customer.statement;

  if (date) {
    const dateFormatted = new Date(date + " 00:00");

    statement = statement.filter(
      (operation) =>
        operation.created_at.toDateString() ===
        new Date(dateFormatted).toDateString()
    );
  }

  return res.status(200).json(statement);
});

app.post("/deposit", (req, res) => {
  const { amount, description } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return res
    .status(201)
    .json({ message: "Deposit was successfully created", customer });
});

app.post("/withdraw", (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getCustomerBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({ message: "Insufficient funds!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return res
    .status(201)
    .json({ message: "Withdraw was successfully created", customer });
});

app.put("/account", (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res
    .status(201)
    .json({ message: "Customer updated successfully", customer });
});

app.get("/account", (req, res) => {
  const { customer } = req;

  return res.status(201).json(customer);
});

app.listen(3333);
