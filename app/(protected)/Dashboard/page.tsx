"use client"

import {
  Calendar,
  CheckCircle,
  GanttChartSquare,
  ListChecks,
  PenBox,
  Plus,
  Wallet,
  TrendingUp,
  Clock,
  Target,
  Zap,
  BookOpen,
  Star,
  ArrowRight,
  Activity,
  Award,
} from "lucide-react"
import Link from "next/link"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { AnimatedCard } from "@/components/animated/animated-card"
import { AnimatedButton } from "@/components/animated/animated-button"
import { StaggerContainer } from "@/components/animated/stagger-container"
import { AnimatedProgress } from "@/components/animated/animated-progress"
import { PageWrapper } from "@/components/animated/page-wrapper"
import { itemVariants, floatingVariants, pulseVariants } from "@/lib/animations"
import { useState, useEffect } from "react";

export default function Dashboard() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  const userName = "Youssef"

  // Add state for your data
  const [tasks, setTasks] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [finance, setFinance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [tasksRes, goalsRes, habitsRes, financeRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/goals"),
          fetch("/api/habits"),
          fetch("/api/finance"),
        ]);
        const [tasksData, goalsData, habitsData, financeData] = await Promise.all([
          tasksRes.json(),
          goalsRes.json(),
          habitsRes.json(),
          financeRes.json(),
        ]);
        console.log("financeData", financeData.data);
        setTasks(Array.isArray(tasksData.data) ? tasksData.data : []);
        setGoals(Array.isArray(goalsData.data) ? goalsData.data : []);
        setHabits(Array.isArray(habitsData.data) ? habitsData.data : []);
        setFinance(Array.isArray(financeData.data) ? financeData.data : []);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Derived data for widgets
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Streak: find the habit with the highest streak
  const currentStreak = habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  const topHabit = habits.reduce((max, h) => (h.streak > (max?.streak || 0) ? h : max), null);

  // Utility for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  // Calculate remaining money from finance data
  const totalIncome = finance
    .filter((f: any) => f.type === "INCOME")
    .reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
  const totalExpenses = finance
    .filter((f: any) => f.type === "EXPENSE")
    .reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
  const remainingMoney = totalIncome - totalExpenses;

  // Active Goals
  const activeGoals = goals.filter(g => !g.completed);
  const onTrack = activeGoals.filter(g => g.status === "on-track").length;
  const needAttention = activeGoals.length - onTrack;

  // Today's Focus: tasks due today
  const today = new Date().toISOString().slice(0, 10);
  const todaysTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(today)).slice(0, 3);

  // Recent Activity: combine recent tasks, goals, finance, etc.
  const recentActivity = [
    ...tasks.filter(t => t.completed).map(t => ({
      action: "Completed task",
      item: t.title,
      time: new Date(t.updatedAt || t.completedAt || t.dueDate).toLocaleString(),
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    })),
    ...goals.filter(g => g.completed).map(g => ({
      action: "Completed goal",
      item: g.title,
      time: new Date(g.updatedAt || g.completedAt || g.targetDate).toLocaleString(),
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    })),
    ...finance.map(f => ({
      action: f.type === 'EXPENSE' ? "Logged expense" : "Logged income",
      item: `${formatCurrency(typeof f.amount === 'number' ? f.amount : 0)} - ${f.description || 'Unknown'}`,
      time: new Date(f.date).toLocaleString(),
      icon: Wallet,
      color: f.type === 'EXPENSE' ? "text-orange-600" : "text-green-600",
      bg: f.type === 'EXPENSE' ? "bg-orange-100 dark:bg-orange-900/30" : "bg-green-100 dark:bg-green-900/30",
    })),
  ].sort((a, b) => {
    const dateA = new Date(a.time).getTime();
    const dateB = new Date(b.time).getTime();
    return dateB - dateA;
  }).slice(0, 4);

  // Upcoming Tasks
  const upcomingTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const due = new Date(t.dueDate);
    const now = new Date();
    return due > now;
  });
  const todayTasks = upcomingTasks.filter(t => t.dueDate && t.dueDate.startsWith(today));
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const tomorrowTasks = upcomingTasks.filter(t => t.dueDate && t.dueDate.startsWith(tomorrowStr));
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
  const weekTasks = upcomingTasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due > new Date() && due <= weekEnd;
  });

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-96">
          <span>Loading...</span>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 1.0, ease: "easeOut" }}
            className="flex items-center gap-4"
          >
            <Avatar className="h-[60px] w-[70px]">
              <AvatarImage src="https://i.ibb.co/HL0xCnFn/Me.png" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {greeting}, {userName}! 👋
              </h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1.0, ease: "easeOut" }}
            className="mt-4 md:mt-0 flex gap-2"
          >
            <AnimatedButton asChild variant="outline">
              <Link href="/tasks">
                <ListChecks className="mr-2 h-4 w-4" />
                View All Tasks
              </Link>
            </AnimatedButton>
          </motion.div>
        </motion.div>

        {/* Today's Focus Section */}


        {/* Key Metrics */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={itemVariants}>
            <AnimatedCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <motion.div
                  variants={pulseVariants}
                  animate="animate"
                  className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                  className="text-2xl font-bold text-green-600"
                >
                  {completedTasks}/{totalTasks}
                </motion.div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {completionRate}% completion rate
                </p>
                <AnimatedProgress value={completionRate} delay={0.8} className="mt-3 h-2" />
              </CardContent>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"
                >
                  <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0, type: "spring", stiffness: 100, damping: 15 }}
                  className="text-2xl font-bold text-orange-600"
                >
                  {currentStreak} Days
                </motion.div>
                <p className="text-xs text-muted-foreground">
                  {topHabit?.title || "No habit found"}
                </p>
                <motion.div
                  className="mt-3 flex gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  {Array.from({ length: currentStreak }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 1.6 + i * 0.15, duration: 0.6, ease: "easeOut" }}
                      className="h-2 flex-1 bg-orange-500 rounded-full"
                    />
                  ))}
                </motion.div>
              </CardContent>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining Money</CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 100, damping: 15 }}
                  className="text-2xl font-bold text-blue-600"
                >
                  {formatCurrency(remainingMoney)}
                </motion.div>
                <p className="text-xs text-muted-foreground">Money left this month</p>
                <AnimatedProgress 
                  value={totalIncome > 0 ? Math.round((remainingMoney / totalIncome) * 100) : 0} 
                  delay={1.2} 
                  className="mt-3 h-2" 
                />
              </CardContent>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring", stiffness: 100, damping: 15 }}
                  className="text-2xl font-bold text-purple-600"
                >
                  {activeGoals.length}
                </motion.div>
                <p className="text-xs text-muted-foreground">
                  {onTrack} on track, {needAttention} need attention
                </p>
                <motion.div
                  className="mt-3 flex gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.0 }}
                >
                  {Array.from({ length: onTrack }).map((_, i) => (
                  <motion.div
                      key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                      transition={{ delay: 2.1 + i * 0.15, duration: 0.6, ease: "easeOut" }}
                    className="h-2 flex-1 bg-green-500 rounded-full"
                  />
                  ))}
                  {Array.from({ length: needAttention }).map((_, i) => (
                  <motion.div
                      key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                      transition={{ delay: 2.2 + i * 0.15, duration: 0.6, ease: "easeOut" }}
                    className="h-2 flex-1 bg-yellow-500 rounded-full"
                  />
                  ))}
                </motion.div>
              </CardContent>
            </AnimatedCard>
          </motion.div>
        </StaggerContainer>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.0, ease: "easeOut" }}
        >
          <AnimatedCard className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div variants={pulseVariants} animate="animate">
                    <Target className="h-5 w-5 text-primary" />
                  </motion.div>
                  <CardTitle className="text-xl">Today's Focus</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {todaysTasks.length} priorities
                </Badge>
              </div>
              <CardDescription>Your most important tasks for today</CardDescription>
            </CardHeader>
            <CardContent>
              <StaggerContainer className="space-y-3">
                {todaysTasks.map((task, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.5)" }}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-background/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <motion.div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                        task.completed ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {task.completed && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            task.priority === "High"
                              ? "border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/30"
                              : "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-950/30"
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time}
                        </span>
                        <span>{task.category}</span>
                      </div>
                    </div>
                    <AnimatedButton variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </AnimatedButton>
                  </motion.div>
                ))}
              </StaggerContainer>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Tasks & Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.0, ease: "easeOut" }}
            >
              <AnimatedCard>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <CardTitle>Recent Activity</CardTitle>
                    </div>
                    <AnimatedButton variant="ghost" size="sm" asChild>
                      <Link href="/activity">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </AnimatedButton>
                  </div>
                </CardHeader>
                <CardContent>
                  <StaggerContainer className="space-y-4">
                    {recentActivity.map((activity, i) => {
                      const Icon = activity.icon
                      return (
                        <motion.div
                          key={i}
                          variants={itemVariants}
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer"
                        >
                          <div className={`h-8 w-8 rounded-full ${activity.bg} flex items-center justify-center`}>
                            <Icon className={`h-4 w-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {activity.action} <span className="text-muted-foreground">{activity.item}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </StaggerContainer>
                </CardContent>
              </AnimatedCard>
            </motion.div>

            {/* Upcoming Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 1.0, ease: "easeOut" }}
            >
              <AnimatedCard>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <CardTitle>Upcoming Tasks</CardTitle>
                    </div>
                    <AnimatedButton variant="ghost" size="sm" asChild>
                      <Link href="/tasks">
                        Manage Tasks
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </AnimatedButton>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="today" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="today">Today</TabsTrigger>
                      <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                      <TabsTrigger value="week">This Week</TabsTrigger>
                    </TabsList>
                    <TabsContent value="today" className="mt-4">
                      <StaggerContainer className="space-y-3">
                        {todayTasks.map((task, i) => (
                          <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ x: 4 }}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-all duration-200"
                          >
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">{task.time}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                task.priority === "High"
                                  ? "border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/30"
                                  : task.priority === "Medium"
                                    ? "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-950/30"
                                    : "border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950/30"
                              }
                            >
                              {task.priority}
                            </Badge>
                          </motion.div>
                        ))}
                      </StaggerContainer>
                    </TabsContent>
                    <TabsContent value="tomorrow" className="mt-4">
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No tasks scheduled for tomorrow</p>
                        <AnimatedButton variant="outline" size="sm" className="mt-2">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Task
                        </AnimatedButton>
                      </div>
                    </TabsContent>
                    <TabsContent value="week" className="mt-4">
                      <StaggerContainer className="space-y-3">
                        {weekTasks.map((task, i) => (
                          <motion.div
                            key={i}
                            variants={itemVariants}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">{task.date}</p>
                            </div>
                            <Badge variant="outline">{task.priority}</Badge>
                          </motion.div>
                        ))}
                      </StaggerContainer>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </AnimatedCard>
            </motion.div>
          </div>

          {/* Right Column - Quick Access & Insights */}
          <div className="space-y-6">


            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 1.0, ease: "easeOut" }}
            >
              <AnimatedCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Daily Goals", progress: 75, color: "bg-green-500" },
                    { label: "Weekly Habits", progress: 60, color: "bg-blue-500" },
                    { label: "Monthly Budget", progress: 78, color: "bg-orange-500" },
                    { label: "Learning Goals", progress: 45, color: "bg-purple-500" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.0 + i * 0.2, duration: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${item.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ delay: 2.0 + i * 0.2, duration: 1.2, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </AnimatedCard>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 1.0, ease: "easeOut" }}
            >
              <AnimatedCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StaggerContainer className="space-y-3">
                    {[
                      {
                        title: "7-Day Streak",
                        description: "Completed daily exercise",
                        icon: "🔥",
                        time: "Today",
                      },
                      {
                        title: "Budget Goal",
                        description: "Stayed under monthly budget",
                        icon: "💰",
                        time: "Yesterday",
                      },
                      {
                        title: "Project Milestone",
                        description: "Completed website redesign",
                        icon: "🎯",
                        time: "2 days ago",
                      },
                    ].map((achievement, i) => (
                      <motion.div
                        key={i}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
                      >
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{achievement.time}</span>
                      </motion.div>
                    ))}
                  </StaggerContainer>
                </CardContent>
              </AnimatedCard>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
