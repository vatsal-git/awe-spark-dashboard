
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Award, Trophy, Star, Gift, Zap, Leaf, Users } from 'lucide-react';

const achievements = [
  { id: 1, title: 'Energy Saver', description: 'Reduced energy by 10%', icon: Zap, completed: true, points: 100 },
  { id: 2, title: 'Dark Mode Hero', description: 'Used dark mode for 30 days', icon: Star, completed: true, points: 150 },
  { id: 3, title: 'Team Player', description: 'Optimal seating for 5 days', icon: Users, completed: false, points: 200, progress: 60 },
  { id: 4, title: 'Eco Champion', description: 'Plant 5 virtual trees', icon: Leaf, completed: false, points: 300, progress: 40 },
];

const rewards = [
  { id: 1, title: 'Coffee Voucher', cost: 500, available: true, icon: '☕' },
  { id: 2, title: 'Plant for Desk', cost: 800, available: true, icon: '🌱' },
  { id: 3, title: 'Eco-Friendly Water Bottle', cost: 1200, available: true, icon: '🍃' },
  { id: 4, title: 'Work From Home Day', cost: 1500, available: false, icon: '🏠' },
];

interface GameficationPanelProps {
  user: {
    name: string;
    email: string;
    awePoints: number;
    level: string;
  };
}

export function GameficationPanel({ user }: GameficationPanelProps) {
  const { user: authUser } = useAuth();
  const { updateProfile } = useUserProfile();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const nextLevelPoints = 1500;
  const progressToNext = (user.awePoints / nextLevelPoints) * 100;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, awe_points')
        .order('awe_points', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to mock data
        setLeaderboard([
          { full_name: user.name, awe_points: user.awePoints, rank: 1 },
          { full_name: 'Sarah Chen', awe_points: 2150, rank: 2 },
          { full_name: 'Alex Johnson', awe_points: 1250, rank: 3 },
          { full_name: 'Mike Rodriguez', awe_points: 1180, rank: 4 },
          { full_name: 'Emma Wilson', awe_points: 950, rank: 5 },
        ]);
      } else {
        const leaderboardWithRanks = data.map((profile, index) => ({
          ...profile,
          rank: index + 1,
        }));
        setLeaderboard(leaderboardWithRanks);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Fallback to mock data
      setLeaderboard([
        { full_name: user.name, awe_points: user.awePoints, rank: 1 },
        { full_name: 'Sarah Chen', awe_points: 2150, rank: 2 },
        { full_name: 'Alex Johnson', awe_points: 1250, rank: 3 },
        { full_name: 'Mike Rodriguez', awe_points: 1180, rank: 4 },
        { full_name: 'Emma Wilson', awe_points: 950, rank: 5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRewardRedeem = async (reward: any) => {
    if (!authUser || user.awePoints < reward.cost) return;

    try {
      const newAwePoints = user.awePoints - reward.cost;
      await updateProfile({ awe_points: newAwePoints });
      console.log(`Redeemed: ${reward.title} for ${reward.cost} points`);
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* User Progress */}
      <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Your Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{user.awePoints}</div>
            <p className="text-purple-100">Awe Points</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {user.level}+</span>
              <span>{user.awePoints}/{nextLevelPoints}</span>
            </div>
            <Progress value={progressToNext} className="bg-purple-300" />
          </div>

          <Badge className="w-full justify-center bg-white/20 text-white hover:bg-white/30">
            Current Level: {user.level}
          </Badge>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="lg:col-span-2 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Award className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    achievement.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.completed ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={achievement.completed ? "default" : "secondary"}>
                          {achievement.points} points
                        </Badge>
                        {!achievement.completed && achievement.progress && (
                          <span className="text-xs text-gray-500">{achievement.progress}%</span>
                        )}
                      </div>
                      {!achievement.completed && achievement.progress && (
                        <Progress value={achievement.progress} className="mt-2 h-1" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Trophy className="h-5 w-5" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-gray-500">Loading leaderboard...</div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((profile, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    profile.full_name === user.name ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    profile.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    profile.rank === 2 ? 'bg-gray-300 text-gray-800' :
                    profile.rank === 3 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {profile.rank}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-gradient-to-r from-green-500 to-blue-500 text-white">
                      {(profile.full_name || 'U').split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{profile.full_name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-600">{profile.awe_points || 0} points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards Store */}
      <Card className="lg:col-span-2 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Gift className="h-5 w-5" />
            <span>Rewards Store</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  reward.available ? 'border-blue-200 bg-blue-50 hover:border-blue-300' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{reward.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{reward.title}</h4>
                    <p className="text-sm text-gray-600">{reward.cost} points</p>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!reward.available || user.awePoints < reward.cost}
                    onClick={() => handleRewardRedeem(reward)}
                    className={reward.available && user.awePoints >= reward.cost ? 
                      'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' : 
                      ''
                    }
                  >
                    {reward.available ? 'Redeem' : 'Sold Out'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
