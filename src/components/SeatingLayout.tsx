
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Lightbulb, Wind } from "lucide-react";
import { trackingService } from "@/lib/tracking/trackingService";
import { db, Seat, Zone } from "@/lib/data/dbService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function SeatingLayout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [currentUserSeat, setCurrentUserSeat] = useState<number | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [recommendations, setRecommendations] = useState<
    Array<{
      seat: number;
      reason: string;
      savings: string;
    }>
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load mock data since db.json might not have the exact structure
    const mockSeats: Seat[] = [
      { id: 1, x: 100, y: 100, occupied: false, energyLevel: "low" },
      { id: 2, x: 150, y: 100, occupied: true, userId: "user1", energyLevel: "medium" },
      { id: 3, x: 200, y: 100, occupied: false, energyLevel: "high" },
      { id: 4, x: 100, y: 150, occupied: false, energyLevel: "low" },
      { id: 5, x: 150, y: 150, occupied: false, energyLevel: "medium" },
      { id: 6, x: 200, y: 150, occupied: false, energyLevel: "low" },
      { id: 7, x: 300, y: 100, occupied: true, userId: "user2", energyLevel: "medium" },
      { id: 8, x: 350, y: 100, occupied: false, energyLevel: "high" },
      { id: 9, x: 300, y: 150, occupied: false, energyLevel: "low" },
      { id: 10, x: 350, y: 150, occupied: false, energyLevel: "medium" },
    ];

    const mockZones: Zone[] = [
      {
        id: 1,
        name: "Development Zone",
        x: 80,
        y: 80,
        width: 150,
        height: 100,
        seats: [1, 2, 3, 4, 5, 6],
        devices: ["8x Lights", "2x AC", "1x Fan"]
      },
      {
        id: 2,
        name: "Collaboration Zone",
        x: 280,
        y: 80,
        width: 150,
        height: 100,
        seats: [7, 8, 9, 10],
        devices: ["6x Lights", "1x AC", "2x Fan"]
      }
    ];

    setSeats(mockSeats);
    setZones(mockZones);

    // Set current user's seat (mock)
    if (user) {
      setCurrentUserSeat(1); // Mock current seat
    }

    // Calculate recommendations
    const optimalSeats = await calculateOptimalSeats(mockSeats);
    setRecommendations(optimalSeats);
  };

  const calculateOptimalSeats = async (
    seats: Seat[]
  ): Promise<
    Array<{
      seat: number;
      reason: string;
      savings: string;
    }>
  > => {
    const availableSeats = seats.filter((s) => !s.occupied);
    const recommendations = [];

    for (const seat of availableSeats) {
      const proximityScore = await trackingService.calculateProximityScore(seat.id);
      const energyLevel = seat.energyLevel;

      let reason = "";
      let savings = "";

      if (proximityScore < 100) {
        reason = "Close to colleagues, optimal collaboration";
        savings = "15% energy";
      } else if (energyLevel === "low") {
        reason = "Energy-efficient zone";
        savings = "20% energy";
      } else {
        reason = "Balanced location";
        savings = "10% energy";
      }

      recommendations.push({
        seat: seat.id,
        reason,
        savings,
      });
    }

    return recommendations.slice(0, 3);
  };

  const handleSeatSelection = async (seatId: number) => {
    setSelectedSeat(seatId);
    if (user) {
      await trackingService.trackSeating(user.id, seatId);
      await loadData();
    }
  };

  const handleMoveToSeat = async (seatId: number) => {
    if (!user) return;

    try {
      // Update the seats data to reflect the move
      const updatedSeats = seats.map(seat => {
        if (seat.id === currentUserSeat) {
          // Free up the current seat
          return { ...seat, occupied: false, userId: undefined };
        }
        if (seat.id === seatId) {
          // Occupy the new seat
          return { ...seat, occupied: true, userId: user.id };
        }
        return seat;
      });

      setSeats(updatedSeats);
      setCurrentUserSeat(seatId);
      setSelectedSeat(null);

      // Track the seating change
      await trackingService.trackSeating(user.id, seatId);

      toast({
        title: "Seat Changed Successfully!",
        description: `You have moved to seat #${seatId}`,
      });

      console.log(`User moved from seat ${currentUserSeat} to seat ${seatId}`);
    } catch (error) {
      console.error("Error moving to seat:", error);
      toast({
        title: "Error",
        description: "Failed to move to the selected seat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.id === currentUserSeat) return "#3b82f6"; // Blue for current user
    if (seat.occupied) return "#10b981"; // Green for occupied
    if (seat.energyLevel === "low") return "#22c55e"; // Light green for optimal
    if (seat.energyLevel === "medium") return "#f59e0b"; // Amber for moderate
    return "#ef4444"; // Red for high energy
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Interactive Office Layout */}
      <Card className="lg:col-span-2 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <MapPin className="h-5 w-5" />
            <span>Office Floor Plan</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Click on seats to see details and recommendations
          </p>
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
                  {/* White background rectangle for zone label */}
                  <rect
                    x={zone.x + 8}
                    y={zone.y + 8}
                    width={zone.name.length * 9 + 12}
                    height={22}
                    fill="white"
                    stroke="rgba(59, 130, 246, 0.6)"
                    strokeWidth="1"
                    rx="6"
                    opacity="0.95"
                  />
                  <text
                    x={zone.x + 14}
                    y={zone.y + 22}
                    className="text-sm font-bold"
                    style={{ 
                      fontSize: '13px',
                      fill: '#1f2937',
                      fontWeight: '600'
                    }}
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
                    onClick={() => handleSeatSelection(seat.id)}
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
                <text x={25} y={15} className="text-xs fill-gray-600">
                  You
                </text>

                <circle cx={80} cy={10} r={8} fill="#10b981" />
                <text x={95} y={15} className="text-xs fill-gray-600">
                  Occupied
                </text>

                <circle cx={170} cy={10} r={8} fill="#22c55e" />
                <text x={185} y={15} className="text-xs fill-gray-600">
                  Low Energy
                </text>

                <circle cx={270} cy={10} r={8} fill="#f59e0b" />
                <text x={285} y={15} className="text-xs fill-gray-600">
                  Medium
                </text>

                <circle cx={350} cy={10} r={8} fill="#ef4444" />
                <text x={365} y={15} className="text-xs fill-gray-600">
                  High Energy
                </text>
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
                const seat = seats.find((s) => s.id === selectedSeat);
                return seat ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      {seat.occupied
                        ? `Occupied by ${seat.userId}`
                        : "Available"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Energy Level:{" "}
                      {seat.energyLevel.charAt(0).toUpperCase() +
                        seat.energyLevel.slice(1)}
                    </p>
                    {!seat.occupied && seat.id !== currentUserSeat && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        onClick={() => handleMoveToSeat(seat.id)}
                      >
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
                <div
                  key={index}
                  className="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-800">
                      Seat #{rec.seat}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
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
                    <span className="font-medium text-sm text-gray-800">
                      {zone.name}
                    </span>
                    <Badge variant="outline">Auto</Badge>
                  </div>
                  <div className="space-y-1">
                    {zone.devices.map((device, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs"
                      >
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
                <span className="font-bold">
                  {seats.filter((s) => s.occupied).length}/{seats.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100">Energy Saved:</span>
                <span className="font-bold">23%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100">Optimal Seating:</span>
                <span className="font-bold">
                  {
                    seats.filter((s) => s.occupied && s.energyLevel === "low")
                      .length
                  }
                  /{seats.filter((s) => s.occupied).length} people
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
