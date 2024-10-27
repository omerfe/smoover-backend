import express from "express";
import payload from "payload";
import { User } from "payload/dist/auth";
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

require("dotenv").config();
const app = express();

// Redirect root to Admin panel
app.get("/", (_, res) => {
  res.redirect("/admin");
});

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  // Authentication endpoints
  app.post("/api/register", async (req, res) => {
    try {
      const user = await payload.create({
        collection: "users",
        data: req.body,
      });
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await payload.login({
        collection: "users",
        data: { email, password },
      });
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });

  // Task API endpoints
  app.use("/api/tasks", payload.authenticate);

  app.post("/api/tasks", async (req, res) => {
    try {
      // if (!req.user) {
      //   return res.status(401).json({ error: "Unauthorized" });
      // }
      const task = await payload.create({
        collection: "tasks",
        data: { ...req.body, user: req.user.id },
      });
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const tasks = await payload.find({
        collection: "tasks",
        where: {
          user: {
            equals: req.user.id,
          },
        },
      });
      res.json(tasks);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const task = await payload.findByID({
        collection: "tasks",
        id: req.params.id,
      });
      if (
        !task ||
        !task.user ||
        typeof task.user !== "object" ||
        !("id" in task.user)
      ) {
        return res.status(404).json({ error: "Task not found or invalid" });
      }
      if (task.user.id !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const updatedTask = await payload.update({
        collection: "tasks",
        id: req.params.id,
        data: req.body,
      });
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const task = await payload.delete({
        collection: "tasks",
        id: req.params.id,
      });
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.listen(8080);
};

start();
