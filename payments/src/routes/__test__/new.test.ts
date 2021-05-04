import { OrderStatus } from "@juanckets/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";

it("retuns an 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "asdasdas",
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("retuns an 401 when purchasing an order that does not belong to the user", async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 12,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "asdasdas",
      orderId: order.id,
    })
    .expect(401);
});

it("retuns an 400 when purchasing a cancelled order", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 12,
    status: OrderStatus.Cancelled,
    userId,
    version: 0,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "asdasdas",
      orderId: order.id,
    })
    .expect(400);
});

it("retuns an 201 with valid inputs", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price,
    status: OrderStatus.Created,
    userId,
    version: 0,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});
