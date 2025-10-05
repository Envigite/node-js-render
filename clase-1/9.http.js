import http from "node:http";
import { findAvailablePort } from "./10.free-port.js";

const desiredPort = process.env.PORT ?? 3000;

const server = http.createServer((req, res) => {
  console.log("request received");
  res.end("Hola Mundo");
});

findAvailablePort(desiredPort).then((port) => {
  server.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
  });
});

/* server.listen(0, () => {
  console.log(
    `Server listening on port http://localhost:${server.address().port}`
  );
}); */
