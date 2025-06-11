
import { db } from "../data/dbService";

class TrackingService {
  private laptopTrackingInterval: NodeJS.Timeout | null = null;
  private currentUserId: string | null = null;

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

  startLaptopTracking(userId: string) {
    console.log("Starting laptop tracking for user:", userId);
    this.currentUserId = userId;
    
    // Track laptop metrics every 30 seconds
    this.laptopTrackingInterval = setInterval(() => {
      this.trackCurrentLaptopState(userId);
    }, 30000);

    // Track initial state
    this.trackCurrentLaptopState(userId);
  }

  stopLaptopTracking() {
    console.log("Stopping laptop tracking");
    if (this.laptopTrackingInterval) {
      clearInterval(this.laptopTrackingInterval);
      this.laptopTrackingInterval = null;
    }
    this.currentUserId = null;
  }

  private async trackCurrentLaptopState(userId: string) {
    try {
      // Detect dark mode
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Calculate uptime (simulate based on session time)
      const sessionStart = sessionStorage.getItem('sessionStart');
      let uptime = 0;
      if (sessionStart) {
        uptime = (Date.now() - parseInt(sessionStart)) / 1000 / 3600; // hours
      } else {
        sessionStorage.setItem('sessionStart', Date.now().toString());
      }

      // Determine energy mode (simulate based on battery if available)
      let energyMode: "power-saver" | "balanced" | "performance" = "balanced";
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          if (battery.charging === false && battery.level < 0.2) {
            energyMode = "power-saver";
          } else if (battery.charging) {
            energyMode = "performance";
          }
        } catch (e) {
          // Fallback to balanced mode
        }
      }

      // Calculate energy consumption (simulate based on usage patterns)
      const baseConsumption = 50; // 50W base
      const darkModeMultiplier = isDarkMode ? 0.9 : 1.0; // 10% savings in dark mode
      const energyModeMultiplier = energyMode === "power-saver" ? 0.7 : energyMode === "performance" ? 1.3 : 1.0;
      const energyConsumption = baseConsumption * darkModeMultiplier * energyModeMultiplier;

      await this.trackLaptopMetrics(userId, {
        isDarkMode,
        uptime,
        energyMode,
        energyConsumption
      });

      console.log("Tracked laptop metrics:", { isDarkMode, uptime, energyMode, energyConsumption });
    } catch (error) {
      console.error("Error tracking laptop state:", error);
    }
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
