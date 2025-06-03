import {
  db,
  LaptopMetric,
  SeatingMetric,
  EnergyMetric,
} from "../data/dbService";

class TrackingService {
  private static instance: TrackingService;
  private isTracking: boolean = false;
  private trackingInterval: number | null = null;
  private lastUptime: number = 0;

  private constructor() {}

  public static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  // Laptop Tracking
  async startLaptopTracking(userId: string) {
    if (this.isTracking) return;

    this.isTracking = true;
    this.lastUptime = performance.now();

    this.trackingInterval = window.setInterval(async () => {
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const uptime = this.calculateUptime();
      const energyMode = await this.getEnergyMode();
      const energyConsumption = this.calculateEnergyConsumption(
        uptime,
        isDarkMode
      );

      await db.addLaptopMetric({
        userId,
        isDarkMode,
        uptime,
        energyMode,
        energyConsumption,
      });

      // Update awe points based on energy efficiency
      await this.updateAwePoints(userId, {
        uptime,
        isDarkMode,
        energyConsumption,
      });
    }, 60000); // Update every minute
  }

  stopLaptopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    this.isTracking = false;
  }

  private calculateUptime(): number {
    const currentUptime = performance.now();
    const uptimeHours = (currentUptime - this.lastUptime) / (1000 * 60 * 60);
    this.lastUptime = currentUptime;
    return uptimeHours;
  }

  private async getEnergyMode(): Promise<
    "power-saver" | "balanced" | "performance"
  > {
    if ("getBattery" in navigator) {
      const battery = await navigator.getBattery();
      return battery.charging ? "performance" : "power-saver";
    }
    return "balanced";
  }

  private calculateEnergyConsumption(
    uptime: number,
    isDarkMode: boolean
  ): number {
    // Base energy consumption per hour
    const baseConsumption = 0.05; // kWh
    // Dark mode reduces energy consumption by 20%
    const darkModeMultiplier = isDarkMode ? 0.8 : 1;
    return baseConsumption * uptime * darkModeMultiplier;
  }

  private async updateAwePoints(
    userId: string,
    metrics: {
      uptime: number;
      isDarkMode: boolean;
      energyConsumption: number;
    }
  ) {
    const user = await db.getUser(userId);
    if (!user) return;

    // Calculate eco score (0-1)
    const darkModeScore = metrics.isDarkMode ? 0.4 : 0;
    const uptimeScore = Math.min(metrics.uptime / 1.2, 1) * 0.3;
    const energyScore = Math.max(0, 1 - metrics.energyConsumption / 0.05) * 0.3;

    const ecoScore = darkModeScore + uptimeScore + energyScore;

    // Calculate awe points delta (-10 to +10)
    const awePointsDelta = Math.round((ecoScore - 0.5) * 20);
    const finalDelta = Math.max(-10, Math.min(10, awePointsDelta));

    // Update user's awe points
    user.awePoints = Math.max(0, user.awePoints + finalDelta);
    await db.updateUser(user);
  }

  // Seating Tracking
  async trackSeating(userId: string, seatId: number) {
    const seat = await db.getSeat(seatId);
    if (!seat) return;

    const proximityScore = await this.calculateProximityScore(seatId);

    await db.addSeatingMetric({
      userId,
      seatId,
      energyLevel: seat.energyLevel,
      proximityScore,
    });

    // Update user's seat
    await db.updateUserSeat(userId, seatId);
  }

  private async calculateProximityScore(seatId: number): Promise<number> {
    const seats = await db.getSeats();
    const targetSeat = seats.find((s) => s.id === seatId);
    if (!targetSeat) return 0;

    let totalProximity = 0;
    let occupiedSeats = 0;

    seats.forEach((seat) => {
      if (seat.occupied && seat.id !== seatId) {
        const distance = Math.sqrt(
          Math.pow(targetSeat.x - seat.x, 2) +
            Math.pow(targetSeat.y - seat.y, 2)
        );
        totalProximity += distance;
        occupiedSeats++;
      }
    });

    return occupiedSeats > 0 ? totalProximity / occupiedSeats : 0;
  }

  // Energy Tracking
  async trackZoneEnergy(zoneId: number) {
    const zone = await db.getZone(zoneId);
    if (!zone) return;

    const consumption = await db.calculateZoneEnergy(zoneId);
    const co2Emissions = this.calculateCO2Emissions(consumption);
    const deviceBreakdown = await this.calculateDeviceBreakdown(zoneId);

    await db.addEnergyMetric({
      zoneId,
      consumption,
      co2Emissions,
      deviceBreakdown,
    });
  }

  private calculateCO2Emissions(consumption: number): number {
    const CO2_FACTOR = 0.233; // kg CO2 per kWh
    return consumption * CO2_FACTOR;
  }

  private async calculateDeviceBreakdown(zoneId: number): Promise<{
    laptops: number;
    lighting: number;
    ac: number;
    other: number;
  }> {
    const zone = await db.getZone(zoneId);
    if (!zone) return { laptops: 0, lighting: 0, ac: 0, other: 0 };

    const seats = await db.getSeats();
    const zoneSeats = seats.filter((s) => zone.seats.includes(s.id));

    const occupiedSeats = zoneSeats.filter((s) => s.occupied).length;
    const hasAC = zone.devices.some((d) => d.includes("AC"));
    const hasFan = zone.devices.some((d) => d.includes("Fan"));
    const lightCount = zone.devices.reduce((count, device) => {
      const match = device.match(/(\d+)x Lights/);
      return count + (match ? parseInt(match[1]) : 0);
    }, 0);

    return {
      laptops: occupiedSeats * 50, // 50W per laptop
      lighting: lightCount * 20, // 20W per light
      ac: hasAC ? 1000 : 0, // 1000W for AC
      other: hasFan ? 100 : 0, // 100W for fan
    };
  }
}

export const trackingService = TrackingService.getInstance();
