"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middlewares/auth");
const uploadFile_1 = __importDefault(require("../middlewares/uploadFile"));
const router = express_1.default.Router();
router.post("/register", auth_1.register);
router.post("/login", auth_1.login);
router.get("/verify", auth_1.verifyEmail);
router.post("/logout", auth_1.logout);
router.get("/profile", auth_2.authMiddleware, auth_1.profile);
router.put("/profile", auth_2.authMiddleware, uploadFile_1.default.single("avatarImage"), auth_1.updateProfile);
exports.default = router;
