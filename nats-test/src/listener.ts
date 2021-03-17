import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

// Client id (2nd arg) must be unique
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable()
    .setDurableName("order-service");

  // 2nd arg is queue group
  const subscription = stan.subscribe(
    "ticket:created",
    "orders-service-queue-group",
    options
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }

    msg.ack(); // Acknowledging the message (Only works if setManualAckMode is true)
  });
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
