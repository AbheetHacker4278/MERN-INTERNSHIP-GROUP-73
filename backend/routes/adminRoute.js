import express from "express";
import {
    isAuthenticated,
    isAdmin,
    getAllReservations,
    updateReservationStatus,
    deleteReservation,
    getAllUsers,
    getDashboardStats
} from "../controller/reservation.js";

const router = express.Router();

// All routes require authentication + admin role
router.use(isAuthenticated, isAdmin);

router.get("/stats", getDashboardStats);
router.get("/reservations", getAllReservations);
router.put("/reservations/:id", updateReservationStatus);
router.delete("/reservations/:id", deleteReservation);
router.get("/users", getAllUsers);

export default router;
