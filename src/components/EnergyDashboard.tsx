import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { trackingService } from "@/lib/tracking/trackingService";
import { db, EnergyMetric, LaptopMetric } from "@/lib/data/dbService";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Zap,
  Laptop,
  Moon,
  Sun,
  TrendingDown,
  TrendingUp,
  Leaf,
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const EnergyDashboard = () => {
  const { user } = useAuth();
  const [energyData, setEnergyData] = useState<EnergyMetric[]>([]);
  const [laptopMetrics, setLaptopMetrics] = useState<LaptopMetric[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [laptopHours, setLaptopHours] = useState(0);
  const [todayReduction, setTodayReduction] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Start laptop tracking
    trackingService.startLaptopTracking(user.id);

    // Set up dark mode detection
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener("change", handleDarkModeChange);

    // Load initial data
    loadData();

    // Set up interval for zone energy tracking
    const interval = setInterval(() => {
      loadData();
    }, 300000); // Update every 5 minutes

    return () => {
      trackingService.stopLaptopTracking();
      darkModeMediaQuery.removeEventListener("change", handleDarkModeChange);
      clearInterval(interval);
    };
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Get energy metrics for all zones
    const zones = await db.getZones();
    const allEnergyMetrics: EnergyMetric[] = [];
    for (const zone of zones) {
      const metrics = await db.getEnergyMetrics(zone.id);
      allEnergyMetrics.push(...metrics);
    }
    setEnergyData(allEnergyMetrics);

    // Get laptop metrics
    const metrics = await db.getLaptopMetrics(user.id);
    setLaptopMetrics(metrics);

    // Calculate laptop usage hours
    const totalUptime = metrics.reduce((sum, m) => sum + m.uptime, 0);
    setLaptopHours(totalUptime);

    // Calculate today's reduction compared to yesterday
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    const todayMetrics = allEnergyMetrics.filter((m) =>
      m.timestamp.startsWith(today)
    );
    const yesterdayMetrics = allEnergyMetrics.filter((m) =>
      m.timestamp.startsWith(yesterday)
    );

    const todayTotal = todayMetrics.reduce((sum, m) => sum + m.consumption, 0);
    const yesterdayTotal = yesterdayMetrics.reduce(
      (sum, m) => sum + m.consumption,
      0
    );

    if (yesterdayTotal > 0) {
      const reduction = ((yesterdayTotal - todayTotal) / yesterdayTotal) * 100;
      setTodayReduction(reduction);
    }
  };

  const formatEnergyData = () => {
    const hourlyData = energyData.reduce((acc, metric) => {
      const hour = new Date(metric.timestamp).getHours();
      if (!acc[hour]) {
        acc[hour] = {
          hour: `${hour}:00`,
          consumption: 0,
          co2: 0,
        };
      }
      acc[hour].consumption += metric.consumption;
      acc[hour].co2 += metric.co2Emissions;
      return acc;
    }, {} as Record<number, { hour: string; consumption: number; co2: number }>);

    return Object.values(hourlyData).sort((a, b) => {
      const hourA = parseInt(a.hour.split(":")[0]);
      const hourB = parseInt(b.hour.split(":")[0]);
      return hourA - hourB;
    });
  };

  const formatDeviceData = () => {
    const latestMetrics = energyData[energyData.length - 1];
    if (!latestMetrics) return [];

    return Object.entries(latestMetrics.deviceBreakdown).map(
      ([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })
    );
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Today's Energy Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {energyData.reduce((sum, m) => sum + m.consumption, 0).toFixed(2)}{" "}
              kWh
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {todayReduction > 0 ? "↓" : "↑"}{" "}
              {Math.abs(todayReduction).toFixed(1)}% vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              CO₂ Emissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {energyData
                .reduce((sum, m) => sum + m.co2Emissions, 0)
                .toFixed(2)}{" "}
              kg
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {todayReduction > 0 ? "↓" : "↑"}{" "}
              {Math.abs(todayReduction).toFixed(1)}% vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Laptop Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {laptopHours.toFixed(1)} hrs
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isDarkMode ? "Dark Mode" : "Light Mode"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Team Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-gray-500 mt-1">
              Energy Efficiency Target
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Energy Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formatEnergyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="consumption"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Device Usage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatDeviceData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatDeviceData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
