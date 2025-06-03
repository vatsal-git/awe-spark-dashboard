
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Plus, CheckCircle, Clock, Leaf, Lightbulb, Fan, Thermometer } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  points: number;
  timestamp: string;
  completed: boolean;
}

const availableActivities = [
  { id: 'lights', title: 'Turn off unnecessary lights', points: 50, icon: Lightbulb },
  { id: 'ac', title: 'Adjust thermostat setting', points: 75, icon: Thermometer },
  { id: 'workspace', title: 'Share workspace with colleague', points: 100, icon: Fan },
  { id: 'natural', title: 'Use natural light', points: 30, icon: Leaf },
];

export function ActivityLogger() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [todayPoints, setTodayPoints] = useState(0);

  useEffect(() => {
    // For now, we'll simulate recent activities since we don't have an activities table yet
    // In a real implementation, you'd fetch from a dedicated activities table
    const mockActivities: Activity[] = [
      { 
        id: '1', 
        title: 'Turned off lights when leaving', 
        points: 50, 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completed: true 
      },
      { 
        id: '2', 
        title: 'Used natural light instead of desk lamp', 
        points: 30, 
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        completed: true 
      },
      { 
        id: '3', 
        title: 'Adjusted thermostat by 2°C', 
        points: 75, 
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        completed: true 
      },
    ];
    setRecentActivities(mockActivities);
    
    // Calculate today's points
    const today = new Date().toDateString();
    const todayActivities = mockActivities.filter(activity => 
      new Date(activity.timestamp).toDateString() === today
    );
    const points = todayActivities.reduce((sum, activity) => sum + activity.points, 0);
    setTodayPoints(points);
  }, []);

  const handleLogActivity = async (activity: any) => {
    if (!user || !profile) return;

    try {
      // Add points to user's profile
      const newAwePoints = (profile.awe_points || 0) + activity.points;
      await updateProfile({ awe_points: newAwePoints });

      // Add to recent activities
      const newActivity: Activity = {
        id: Date.now().toString(),
        title: activity.title,
        points: activity.points,
        timestamp: new Date().toISOString(),
        completed: true,
      };

      setRecentActivities(prev => [newActivity, ...prev].slice(0, 4));
      setTodayPoints(prev => prev + activity.points);

      console.log('Activity logged:', activity.title, `+${activity.points} points`);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Log New Activity */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Plus className="h-5 w-5" />
            <span>Log New Activity</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Earn Awe Points by logging your energy-saving actions</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-800">{activity.title}</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        +{activity.points} points
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleLogActivity(activity)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                  >
                    Log It
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Clock className="h-5 w-5" />
            <span>Recent Activities</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Your latest energy-saving contributions</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-800">{activity.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      +{activity.points} points
                    </Badge>
                    <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white text-center">
            <p className="text-sm font-medium">Today's Total: +{todayPoints} Awe Points</p>
            <p className="text-xs opacity-90">Great job! You're making a difference! 🌱</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
