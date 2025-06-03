
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { User, Mail, Calendar, Award, Leaf, Zap, Target, TrendingUp } from 'lucide-react';

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    awePoints: number;
    level: string;
    avatar: string;
  };
}

const userStats = [
  { label: 'Energy Saved This Month', value: '127 kWh', icon: Zap, color: 'text-green-600' },
  { label: 'CO₂ Reduction', value: '34 kg', icon: Leaf, color: 'text-blue-600' },
  { label: 'Activities Logged', value: '23', icon: Target, color: 'text-purple-600' },
  { label: 'Streak Days', value: '12', icon: TrendingUp, color: 'text-orange-600' },
];

const monthlyProgress = [
  { month: 'Jan', points: 890 },
  { month: 'Feb', points: 1150 },
  { month: 'Mar', points: 1250 },
];

export function UserProfile({ user }: UserProfileProps) {
  const nextLevelPoints = 1500;
  const progressToNext = (user.awePoints / nextLevelPoints) * 100;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Profile Card */}
      <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-green-500 to-blue-600 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20 border-4 border-white/30">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-white/20 text-white text-lg">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">{user.name}</CardTitle>
          <p className="text-green-100 text-sm">{user.email}</p>
          <Badge className="bg-white/20 text-white hover:bg-white/30 mt-2">
            {user.level}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{user.awePoints}</div>
            <p className="text-green-100">Total Awe Points</p>
          </div>
          
          <Separator className="bg-white/20" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next level</span>
              <span>{user.awePoints}/{nextLevelPoints}</span>
            </div>
            <Progress value={progressToNext} className="bg-white/20" />
          </div>

          <Button variant="secondary" className="w-full bg-white/20 text-white hover:bg-white/30 border-white/30">
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Card className="lg:col-span-2 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Award className="h-5 w-5" />
            <span>Your Impact</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Track your environmental contributions</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {userStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <IconComponent className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Progress */}
      <Card className="lg:col-span-3 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800">
            <Calendar className="h-5 w-5" />
            <span>Monthly Progress</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Your Awe Points journey over time</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {monthlyProgress.map((month, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">{month.month} 2024</p>
                <p className="text-2xl font-bold text-gray-800">{month.points}</p>
                <p className="text-xs text-gray-500">Awe Points</p>
                {index === monthlyProgress.length - 1 && (
                  <Badge className="mt-2 bg-green-500 text-white">Current</Badge>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white text-center">
            <h3 className="font-bold mb-1">Sustainability Champion!</h3>
            <p className="text-sm opacity-90">
              You're in the top 10% of contributors this month. Keep up the amazing work! 🌟
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
