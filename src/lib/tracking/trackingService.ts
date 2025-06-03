
import { db } from "../data/dbService";

class TrackingService {
  async trackLaptopMetrics(userId: string, metrics: {
    isDarkMode: boolean;
    uptime: number;
    energyMode: "power-saver" | "balanced" | "performance";
    energyConsumption: number;
  }) {
    return await db.addLaptopMetric({
      userId,
      ...metrics
    });
  }

  async trackSeating(userId: string, seatId: number) {
    const proximityScore = await this.calculateProximityScore(seatId);
    
    return await db.addSeatingMetric({
      userId,
      seatId,
      energyLevel: Math.random() * 100, // Placeholder calculation
      proximityScore
    });
  }

  async calculateProximityScore(seatId: number): Promise<number> {
    // Calculate proximity to other occupied seats
    const seats = await db.getSeats();
    const occupiedSeats = seats.filter(s => s.occupied && s.id !== seatId);
    
    if (occupiedSeats.length === 0) return 100;
    
    const targetSeat = seats.find(s => s.id === seatId);
    if (!targetSeat) return 100;
    
    // Calculate average distance to occupied seats
    const distances = occupiedSeats.map(seat => {
      const dx = seat.x - targetSeat.x;
      const dy = seat.y - targetSeat.y;
      return Math.sqrt(dx * dx + dy * dy);
    });
    
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    return Math.min(100, avgDistance);
  }

  async getEnergyReport(userId: string) {
    const laptopMetrics = await db.getLaptopMetrics(userId);
    const seatingMetrics = await db.getSeatingMetrics(userId);
    
    const totalEnergyConsumption = laptopMetrics.reduce((sum, metric) => 
      sum + metric.energyConsumption, 0
    );
    
    const averageProximityScore = seatingMetrics.length > 0 
      ? seatingMetrics.reduce((sum, metric) => sum + metric.proximityScore, 0) / seatingMetrics.length
      : 0;
    
    return {
      totalEnergyConsumption,
      averageProximityScore,
      metricsCount: laptopMetrics.length + seatingMetrics.length,
      potentialSavings: Math.max(0, 100 - averageProximityScore)
    };
  }
}

export const trackingService = new TrackingService();
