import { Router } from "express";
import { getAllUser, updateUser } from "../controllers/usersController";

const router: Router = Router();

router.route("/").get(getAllUser);
router.route("/:id").patch(updateUser);

export default router;
