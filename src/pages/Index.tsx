import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { EnergyDashboard } from "@/components/EnergyDashboard";
import { GameficationPanel } from "@/components/GameficationPanel";
import { SeatingLayout } from "@/components/SeatingLayout";
import { ActivityLogger } from "@/components/ActivityLogger";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Leaf, Zap, Users, Award, Bell, Settings, LogOut, Moon, Sun } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) {
        return stored === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  // Apply theme on mount and when darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const userProfileData = {
    name: profile.full_name || 'EcoTrack User',
    email: profile.email || user.email || '',
    awePoints: profile.awe_points || 0,
    level: profile.level || 'Eco Novice',
    avatar: profile.avatar_url || "/placeholder.svg",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  EcoTrack
                </h1>
                <p className="text-sm text-muted-foreground">
                  Renewable Energy Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
              >
                <Award className="h-4 w-4 mr-1" />
                {userProfileData.awePoints} Awe Points
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span>Dark mode</span>
                    </div>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={toggleTheme}
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-background/60 backdrop-blur-sm">
            <TabsTrigger
              value="dashboard"
              className="flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="gamification"
              className="flex items-center space-x-2"
            >
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Rewards</span>
            </TabsTrigger>
            <TabsTrigger
              value="seating"
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Seating</span>
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="flex items-center space-x-2"
            >
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center space-x-2"
            >
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-xs">P</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6">
              <Card className="border-0 shadow-lg bg-card/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-foreground">
                      Welcome back, {userProfileData.name.split(" ")[0]}! 🌱
                    </CardTitle>
                    <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                      {userProfileData.level}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    You're making a difference! Keep up the great work in our
                    sustainability journey.
                  </p>
                </CardHeader>
              </Card>
              <EnergyDashboard />
            </div>
          </TabsContent>

          <TabsContent value="gamification">
            <GameficationPanel user={userProfileData} />
          </TabsContent>

          <TabsContent value="seating">
            <SeatingLayout />
          </TabsContent>

          <TabsContent value="activities">
            <ActivityLogger />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile user={userProfileData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
