import { Router } from "express";
import {
  getStats,
  getRecap,
  getBarScores,
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/admin.controller";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate, authorizeAdmin);

// Stats & recap
router.get("/stats", getStats);
router.get("/recap", getRecap);
router.get("/scores/bar", getBarScores);

// Teams CRUD
router.get("/teams", getTeams);
router.post("/teams", createTeam);
router.put("/teams/:id", updateTeam);
router.delete("/teams/:id", deleteTeam);

// Users CRUD (Student & Lecturer)
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
