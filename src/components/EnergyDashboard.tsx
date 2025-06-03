import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Zap, Laptop, Moon, Sun, TrendingDown, TrendingUp, Leaf } from 'lucide-react';

const energyData = [
  { time: '9:00', consumption: 45, co2: 12 },
  { time: '10:00', consumption: 52, co2: 14 },
  { time: '11:00', consumption: 48, co2: 13 },
  { time: '12:00', consumption: 35, co2: 9 },
  { time: '13:00', consumption: 28, co2: 7 },
  { time: '14:00', consumption: 58, co2: 16 },
  { time: '15:00', consumption: 62, co2: 17 },
  { time: '16:00', consumption: 55, co2: 15 },
];

const deviceData = [
  { device: 'Laptops', usage: 35, color: '#10b981' },
  { device: 'Lighting', usage: 25, color: '#3b82f6' },
  { device: 'AC/Heating', usage: 30, color: '#f59e0b' },
  { device: 'Other', usage: 10, color: '#8b5cf6' },
];

export function EnergyDashboard() {
  const isDarkMode = false; // This would be detected from the user's system
  const laptopHours = 6.5;
  const todayReduction = 12; // percentage

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Stats Cards */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">
            Today's Energy Use
          </CardTitle>
          <Zap className="h-4 w-4 opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">485 kWh</div>
          <div className="flex items-center space-x-1 text-green-100">
            <TrendingDown className="h-3 w-3" />
            <p className="text-xs">{todayReduction}% vs yesterday</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">
            CO₂ Emissions
          </CardTitle>
          <Leaf className="h-4 w-4 opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">128 kg</div>
          <div className="flex items-center space-x-1 text-blue-100">
            <TrendingDown className="h-3 w-3" />
            <p className="text-xs">8% reduction</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Laptop Usage
          </CardTitle>
          <Laptop className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">{laptopHours}h</div>
          <div className="flex items-center space-x-2 mt-2">
            {isDarkMode ? (
              <Badge variant="secondary" className="bg-gray-800 text-white">
                <Moon className="h-3 w-3 mr-1" />
                Dark Mode
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Sun className="h-3 w-3 mr-1" />
                Light Mode
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Team Goal
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">73%</div>
          <Progress value={73} className="mt-2" />
          <p className="text-xs text-gray-600 mt-1">Monthly target</p>
        </CardContent>
      </Card>

      {/* Energy Consumption Chart */}
      <Card className="col-span-full lg:col-span-2 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Energy Consumption Today</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="consumption" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Energy (kWh)"
              />
              <Line 
                type="monotone" 
                dataKey="co2" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="CO₂ (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Device Usage Breakdown */}
      <Card className="col-span-full lg:col-span-2 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Energy Usage by Device</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="usage"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {deviceData.map((device, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: device.color }}
                />
                <span className="text-sm text-gray-600">{device.device}</span>
                <span className="text-sm font-medium text-gray-800">{device.usage}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
