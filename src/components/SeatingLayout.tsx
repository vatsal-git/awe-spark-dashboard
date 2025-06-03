
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MapPin, Lightbulb, Wind, Thermometer } from 'lucide-react';

const seats = [
  { id: 1, x: 100, y: 100, occupied: true, user: 'Alex J.', energy: 'low' },
  { id: 2, x: 200, y: 100, occupied: false, user: null, energy: 'medium' },
  { id: 3, x: 300, y: 100, occupied: true, user: 'Sarah C.', energy: 'low' },
  { id: 4, x: 400, y: 100, occupied: false, user: null, energy: 'high' },
  { id: 5, x: 100, y: 200, occupied: true, user: 'Mike R.', energy: 'medium' },
  { id: 6, x: 200, y: 200, occupied: false, user: null, energy: 'low' },
  { id: 7, x: 300, y: 200, occupied: true, user: 'Emma W.', energy: 'medium' },
  { id: 8, x: 400, y: 200, occupied: false, user: null, energy: 'low' },
  { id: 9, x: 150, y: 300, occupied: false, user: null, energy: 'low' },
  { id: 10, x: 250, y: 300, occupied: true, user: 'David K.', energy: 'high' },
  { id: 11, x: 350, y: 300, occupied: false, user: null, energy: 'medium' },
];

const zones = [
  { id: 1, x: 50, y: 50, width: 200, height: 120, name: 'Zone A', devices: ['AC Unit', '2x Lights'] },
  { id: 2, x: 270, y: 50, width: 200, height: 120, name: 'Zone B', devices: ['Fan', '3x Lights'] },
  { id: 3, x: 50, y: 250, width: 420, height: 120, name: 'Zone C', devices: ['AC Unit', 'Fan', '4x Lights'] },
];

export function SeatingLayout() {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [currentUserSeat] = useState(1); // Alex's current seat

  const getSeatColor = (seat: any) => {
    if (seat.id === currentUserSeat) return '#3b82f6'; // Blue for current user
    if (seat.occupied) return '#10b981'; // Green for occupied
    if (seat.energy === 'low') return '#22c55e'; // Light green for optimal
    if (seat.energy === 'medium') return '#f59e0b'; // Amber for moderate
    return '#ef4444'; // Red for high energy
  };

  const recommendations = [
    { seat: 6, reason: 'Close to colleagues, low energy zone', savings: '15% energy' },
    { seat: 8, reason: 'Optimal lighting, near team', savings: '12% energy' },
    { seat: 9, reason: 'Natural light access, efficient zone', savings: '18% energy' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Interactive Office Layout */}
      <Card className="lg:col-span-2 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <MapPin className="h-5 w-5" />
            <span>Office Floor Plan</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Click on seats to see details and recommendations</p>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 overflow-auto">
            <svg viewBox="0 0 500 400" className="w-full h-96">
              {/* Zone backgrounds */}
              {zones.map((zone) => (
                <g key={zone.id}>
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    fill="rgba(59, 130, 246, 0.1)"
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    rx="8"
                  />
                  <text
                    x={zone.x + 10}
                    y={zone.y + 20}
                    className="text-xs font-medium fill-blue-600"
                  >
                    {zone.name}
                  </text>
                </g>
              ))}

              {/* Seats */}
              {seats.map((seat) => (
                <g key={seat.id}>
                  <circle
                    cx={seat.x}
                    cy={seat.y}
                    r={seat.id === selectedSeat ? "25" : "20"}
                    fill={getSeatColor(seat)}
                    stroke={seat.id === currentUserSeat ? "#1e40af" : "white"}
                    strokeWidth={seat.id === currentUserSeat ? "3" : "2"}
                    className="cursor-pointer transition-all duration-200 hover:r-[23]"
                    onClick={() => setSelectedSeat(seat.id)}
                  />
                  <text
                    x={seat.x}
                    y={seat.y + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white pointer-events-none"
                  >
                    {seat.id}
                  </text>
                </g>
              ))}

              {/* Legend */}
              <g transform="translate(20, 350)">
                <circle cx={10} cy={10} r={8} fill="#3b82f6" />
                <text x={25} y={15} className="text-xs fill-gray-600">You</text>
                
                <circle cx={80} cy={10} r={8} fill="#10b981" />
                <text x={95} y={15} className="text-xs fill-gray-600">Occupied</text>
                
                <circle cx={170} cy={10} r={8} fill="#22c55e" />
                <text x={185} y={15} className="text-xs fill-gray-600">Low Energy</text>
                
                <circle cx={270} cy={10} r={8} fill="#f59e0b" />
                <text x={285} y={15} className="text-xs fill-gray-600">Medium</text>
                
                <circle cx={350} cy={10} r={8} fill="#ef4444" />
                <text x={365} y={15} className="text-xs fill-gray-600">High Energy</text>
              </g>
            </svg>
          </div>

          {/* Seat Details */}
          {selectedSeat && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-gray-800 mb-2">
                Seat #{selectedSeat} Details
              </h4>
              {(() => {
                const seat = seats.find(s => s.id === selectedSeat);
                return seat ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Status: {seat.occupied ? `Occupied by ${seat.user}` : 'Available'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Energy Level: {seat.energy.charAt(0).toUpperCase() + seat.energy.slice(1)}
                    </p>
                    {!seat.occupied && seat.id !== currentUserSeat && (
                      <Button size="sm" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                        Move Here
                      </Button>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sidebar with recommendations and controls */}
      <div className="space-y-6">
        {/* Smart Recommendations */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Lightbulb className="h-5 w-5" />
              <span>Smart Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-800">Seat #{rec.seat}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {rec.savings}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{rec.reason}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2 w-full border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => setSelectedSeat(rec.seat)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zone Controls */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Wind className="h-5 w-5" />
              <span>Zone Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zones.map((zone) => (
                <div key={zone.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-gray-800">{zone.name}</span>
                    <Badge variant="outline">Auto</Badge>
                  </div>
                  <div className="space-y-1">
                    {zone.devices.map((device, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{device}</span>
                        <span className="text-green-600">●</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Today's Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-emerald-100">Occupied Seats:</span>
                <span className="font-bold">6/11</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100">Energy Saved:</span>
                <span className="font-bold">23%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100">Optimal Seating:</span>
                <span className="font-bold">4/6 people</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
