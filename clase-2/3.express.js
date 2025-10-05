import express from "express";
import dittoJSON from "./pokemon/ditto.json" with { type: "json" };

const PORT = process.env.PORT ?? 3000;

const app = express();
app.disable("x-powered-by"); //por seguridad

app.use(express.json());

// app.use((req, res, next) => {
    
//     if (req.method !== "POST") return next();
//     if (req.headers["content-type"] !== "application/json") return next();

//     //Solo llegan request que son POST y que tienen el header content-type: application/json

//     let body = "";

//     //escuchar el evento data
//     req.on("data", chunk => {
//         body += chunk.toString();
//     })

//     req.on("end", () => {
//         const data = JSON.parse(body);      
//         //mutar la request y meter la información en el req.body
//         req.body = data;
//         next();
//     })
// })

app.get("/", (req, res) => {
  res.send("<h1>Mi página</h1>");
  //   res.json({ message: "Mi página" });
});

app.get("/pokemon/ditto", (req, res) => {
  res.json(dittoJSON);
});

app.post("/pokemon", (req, res) => {
  res.status(201).json(req.body);
});

app.use((req, res) => {
    res.status(404).send("<h1>404 Not Found</h1>")
})

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
