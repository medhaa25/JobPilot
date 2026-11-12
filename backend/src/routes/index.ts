import { Router } from "express";
import { login, logout, me, signup } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import * as applications from "../controllers/applicationController.js"
import * as jobs from "../controllers/jobController.js";
import * as dashboard from "../controllers/dashboardController.js";

const router = Router();

// Auth
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, me);

// Jobs
router.use("/jobs", requireAuth);
router.get("/jobs", jobs.list);
router.get("/jobs/:id", jobs.getOne);
router.post("/jobs/:id/save", jobs.save);
router.delete("/jobs/:id/save", jobs.unsave);

// Applications
router.use("/applications", requireAuth);
router.get("/applications", applications.list);
router.post("/applications", applications.create);
router.get("/applications/:id", applications.getOne);
router.patch("/applications/:id", applications.update);
router.delete("/applications/:id", applications.remove);
router.get("/applications/:id/events", applications.events);
// router.get("/applications/:id/interviews", notImplemented);
// router.post("/applications/:id/interviews", notImplemented);

// dashboard
router.get("/analytics/overview", requireAuth, dashboard.overview);

export default router;
