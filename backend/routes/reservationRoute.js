import express from "express";
import send_reservation, { cancelReservation, getMe, getUserReservations, isAuthenticated, login, logout, signup } from "../controller/reservation.js";
import { Reservation } from "../models/reservation.js";

const router = express.Router();

router.post("/send", isAuthenticated , send_reservation);
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", isAuthenticated, getMe);

// Reservation route - protected with authentication
router.post("/send", isAuthenticated, send_reservation);
router.get("/reservations", isAuthenticated, getUserReservations);
// In your backend routes file
router.delete('/reservations/:id', isAuthenticated, async (req, res) => {
    try {
      const reservation = await Reservation.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id, // Ensure reservation belongs to user
          status: { $ne: 'canceled' } // Only cancel if not already canceled
        },
        { 
          $set: { 
            status: 'canceled',
            updatedAt: Date.now() 
          } 
        },
        { new: true }
      );
  
      if (!reservation) {
        return res.status(404).json({ 
          success: false,
          message: 'Reservation not found or already canceled' 
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Reservation canceled successfully',
        reservation
      });
    } catch (error) {
      console.error('Cancel error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel reservation',
        error: error.message
      });
    }
  });

export default router;
