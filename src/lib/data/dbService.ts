
import dbData from "./db.json";

// Types
export interface LaptopMetric {
  id: string;
  userId: string;
  timestamp: string;
  isDarkMode: boolean;
  uptime: number;
  energyMode: "power-saver" | "balanced" | "performance";
  energyConsumption: number;
}

export interface SeatingMetric {
  id: string;
  userId: string;
  seatId: number;
  timestamp: string;
  energyLevel: number;
  proximityScore: number;
}

export interface EnergyMetric {
  id: string;
  zoneId: number;
  timestamp: string;
  consumption: number;
  co2Emissions: number;
  deviceBreakdown: {
    laptops: number;
    lighting: number;
    ac: number;
    other: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  awePoints: number;
  level: string;
  avatarUrl?: string;
  currentSeatId?: number;
}

export interface Seat {
  id: number;
  x: number;
  y: number;
  occupied: boolean;
  userId?: string;
  energyLevel: "low" | "medium" | "high";
}

export interface Zone {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  seats: number[];
  devices: string[];
}

interface DatabaseData {
  laptopMetrics: LaptopMetric[];
  seatingMetrics: SeatingMetric[];
  energyMetrics: EnergyMetric[];
  users: User[];
  seats: Seat[];
  zones: Zone[];
}

// Dummy data to simulate real backend behavior
const generateDummyData = (): DatabaseData => {
  const users: User[] = [
    {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      awePoints: 1250,
      level: "Eco Champion",
      avatarUrl: "/placeholder.svg",
      currentSeatId: 1
    },
    {
      id: "user-2", 
      name: "Jane Smith",
      email: "jane@example.com",
      awePoints: 890,
      level: "Green Warrior",
      avatarUrl: "/placeholder.svg",
      currentSeatId: 3
    },
    {
      id: "user-3",
      name: "Mike Johnson",
      email: "mike@example.com", 
      awePoints: 2100,
      level: "Sustainability Expert",
      avatarUrl: "/placeholder.svg",
      currentSeatId: 5
    }
  ];

  const seats: Seat[] = [
    { id: 1, x: 100, y: 100, occupied: true, userId: "user-1", energyLevel: "low" },
    { id: 2, x: 200, y: 100, occupied: false, energyLevel: "medium" },
    { id: 3, x: 300, y: 100, occupied: true, userId: "user-2", energyLevel: "high" },
    { id: 4, x: 100, y: 200, occupied: false, energyLevel: "low" },
    { id: 5, x: 200, y: 200, occupied: true, userId: "user-3", energyLevel: "medium" },
    { id: 6, x: 300, y: 200, occupied: false, energyLevel: "high" },
  ];

  const zones: Zone[] = [
    {
      id: 1,
      name: "Main Work Area",
      x: 50,
      y: 50,
      width: 300,
      height: 200,
      seats: [1, 2, 3, 4, 5, 6],
      devices: ["2x AC Units", "8x Lights", "3x Fans"]
    }
  ];

  const laptopMetrics: LaptopMetric[] = [
    {
      id: "metric-1",
      userId: "user-1", 
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isDarkMode: true,
      uptime: 4.5,
      energyMode: "balanced",
      energyConsumption: 45
    },
    {
      id: "metric-2",
      userId: "user-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), 
      isDarkMode: false,
      uptime: 6.2,
      energyMode: "performance",
      energyConsumption: 65
    }
  ];

  const seatingMetrics: SeatingMetric[] = [
    {
      id: "seat-metric-1",
      userId: "user-1",
      seatId: 1,
      timestamp: new Date().toISOString(),
      energyLevel: 75,
      proximityScore: 85
    }
  ];

  const energyMetrics: EnergyMetric[] = [
    {
      id: "energy-1",
      zoneId: 1,
      timestamp: new Date().toISOString(),
      consumption: 2.5,
      co2Emissions: 1.2,
      deviceBreakdown: {
        laptops: 0.5,
        lighting: 0.8,
        ac: 1.0,
        other: 0.2
      }
    }
  ];

  return {
    laptopMetrics,
    seatingMetrics,
    energyMetrics,
    users,
    seats,
    zones
  };
};

class Database {
  private static instance: Database;
  private data: DatabaseData;

  private constructor() {
    // Use dummy data instead of JSON file
    this.data = generateDummyData();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Laptop Metrics
  async addLaptopMetric(
    metric: Omit<LaptopMetric, "id" | "timestamp">
  ): Promise<LaptopMetric> {
    const newMetric: LaptopMetric = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...metric,
    };
    this.data.laptopMetrics.push(newMetric);
    return newMetric;
  }

  async getLaptopMetrics(userId: string): Promise<LaptopMetric[]> {
    return this.data.laptopMetrics.filter((m) => m.userId === userId);
  }

  // Seating Metrics
  async addSeatingMetric(
    metric: Omit<SeatingMetric, "id" | "timestamp">
  ): Promise<SeatingMetric> {
    const newMetric: SeatingMetric = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...metric,
    };
    this.data.seatingMetrics.push(newMetric);
    return newMetric;
  }

  async getSeatingMetrics(userId: string): Promise<SeatingMetric[]> {
    return this.data.seatingMetrics.filter((m) => m.userId === userId);
  }

  // Energy Metrics
  async addEnergyMetric(
    metric: Omit<EnergyMetric, "id" | "timestamp">
  ): Promise<EnergyMetric> {
    const newMetric: EnergyMetric = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...metric,
    };
    this.data.energyMetrics.push(newMetric);
    return newMetric;
  }

  async getEnergyMetrics(zoneId: number): Promise<EnergyMetric[]> {
    return this.data.energyMetrics.filter((m) => m.zoneId === zoneId);
  }

  // Users
  async getUser(userId: string): Promise<User | undefined> {
    return this.data.users.find((u) => u.id === userId);
  }

  async updateUser(user: User): Promise<void> {
    const index = this.data.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.data.users[index] = user;
    }
  }

  async updateUserSeat(userId: string, seatId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.currentSeatId = seatId;
      await this.updateUser(user);
    }
  }

  // Seats
  async getSeats(): Promise<Seat[]> {
    return this.data.seats;
  }

  async getSeat(seatId: number): Promise<Seat | undefined> {
    return this.data.seats.find((s) => s.id === seatId);
  }

  // Zones
  async getZones(): Promise<Zone[]> {
    return this.data.zones;
  }

  async getZone(zoneId: number): Promise<Zone | undefined> {
    return this.data.zones.find((z) => z.id === zoneId);
  }

  async calculateZoneEnergy(zoneId: number): Promise<number> {
    const zone = await this.getZone(zoneId);
    if (!zone) return 0;

    const seats = await this.getSeats();
    const zoneSeats = seats.filter((s) => zone.seats.includes(s.id));
    const occupiedSeats = zoneSeats.filter((s) => s.occupied).length;

    // Calculate energy consumption based on occupied seats and devices
    const seatEnergy = occupiedSeats * 50; // 50W per laptop
    const deviceEnergy = zone.devices.reduce((total, device) => {
      if (device.includes("AC")) return total + 1000; // 1000W for AC
      if (device.includes("Fan")) return total + 100; // 100W for fan
      if (device.includes("Lights")) {
        const match = device.match(/(\d+)x Lights/);
        return total + (match ? parseInt(match[1]) * 20 : 0); // 20W per light
      }
      return total;
    }, 0);

    return (seatEnergy + deviceEnergy) / 1000; // Convert to kWh
  }

  // Additional methods for leaderboard and activities
  async getAllUsers(): Promise<User[]> {
    return this.data.users;
  }

  async getLeaderboard(): Promise<User[]> {
    return this.data.users.sort((a, b) => b.awePoints - a.awePoints);
  }
}

export const db = Database.getInstance();
