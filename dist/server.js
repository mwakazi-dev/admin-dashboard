"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./database/db"));
const auth_routes_1 = __importDefault(require("./routes/auth-routes"));
const error_handler_middleware_1 = __importDefault(require("./middlewares/error-handler-middleware"));
// initialize express server
dotenv_1.default.config();
const app = (0, express_1.default)();
// parse requests
app.use(express_1.default.json());
// cors middleware
app.use((0, cors_1.default)());
// connect to database
(0, db_1.default)();
// all routes
app.use("/api/auth", auth_routes_1.default);
// error handling
app.use(error_handler_middleware_1.default);
// start the express server
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
