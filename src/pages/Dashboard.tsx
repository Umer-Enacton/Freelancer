import React from "react";
import { useAuth } from "../contexts/useAuth";
import { projectApi, timeEntryApi, summaryApi } from "../api";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Folder,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Activity,
  Users,
} from "lucide-react";
import Loader from "../components/Loader";

const COLORS = [
  "#6366F1", // indigo-500
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#6B7280", // gray-500
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Fetch Projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async () => {
      const res = await projectApi.getAll();
      return res.data.projects.filter((p) => p.userId === user?.id);
    },
    enabled: !!user?.id,
  });

  // Fetch Time Entries
  const {
    data: timeEntriesData,
    isLoading: timeEntriesLoading,
    error: timeEntriesError,
  } = useQuery({
    queryKey: ["timeEntries", user?.id],
    queryFn: async () => {
      const res = await timeEntryApi.getAll();
      const userTimeEntries = res.data.timeEntries.filter(
        (te) => te.userId === user?.id
      );

      // Filter out time entries whose projects have been deleted
      const validTimeEntries = userTimeEntries.filter((te) =>
        projectsData?.some((p) => p.id === te.projectId)
      );

      return validTimeEntries;
    },
    enabled: !!user?.id && !!projectsData,
  });

  // Fetch Summaries
  const { data: summariesData, isLoading: summariesLoading } = useQuery({
    queryKey: ["summaries", user?.id],
    queryFn: async () => {
      try {
        const res = await summaryApi.getAllByUser(user!.id);
        return res.data.summaries || [];
      } catch (err) {
        console.log("No summaries found, using empty array", err);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const projects = projectsData || [];
  const timeEntries = timeEntriesData || [];
  const summaries = summariesData || [];

  const isLoading = projectsLoading || timeEntriesLoading || summariesLoading;

  // Stats calculations
  const stats = {
    totalProjects: projects.length,
    totalTimeEntries: timeEntries.length,
    completedEntries: timeEntries.filter((te) => te.completed).length,
    activeEntries: timeEntries.filter((te) => !te.completed).length,
  };

  // Chart data
  const projectTimeData = summaries
    .map((summary) => {
      const timeEntry = timeEntries.find(
        (te) => te.id === Number(summary.timeEntryId)
      );
      const project = projects.find((p) => p.id === timeEntry?.projectId);

      if (!project) return null;

      return {
        name: `${project.name} #${summary.timeEntryId}`,
        netMinutes: summary.Net_WorkTimeMinutes,
        breakMinutes: summary.TotalBreakTimeMinutes,
        grossMinutes: summary.GrossTimeMinutes,
      };
    })
    .filter((item) => item !== null);

  const projectDistribution = projects
    .map((project, index) => {
      const projectEntries = timeEntries.filter(
        (te) => te.projectId === project.id
      );
      return {
        name: project.name,
        value: projectEntries.length,
        color: COLORS[index % COLORS.length],
      };
    })
    .filter((item) => item.value > 0);

  if (isLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (projectsError || timeEntriesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 max-w-md">
          <p className="text-rose-800 font-medium mb-2">
            Error loading dashboard
          </p>
          <p className="text-rose-600 text-sm">
            {(projectsError as Error)?.message ||
              (timeEntriesError as Error)?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user?.name}!</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-slate-600" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">
                Total Projects
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalProjects}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
              <Folder className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">
                Total Entries
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalTimeEntries}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.completedEntries}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">
                Active Entries
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.activeEntries}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Time Breakdown Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Time Breakdown by Project
            </h2>
          </div>
          {projectTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={projectTimeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tick={{ fill: "#64748B" }}
                />
                <YAxis fontSize={12} tick={{ fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "none",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#64748B" }} />
                <Bar
                  dataKey="netMinutes"
                  fill="#6366F1"
                  name="Net Work (min)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="breakMinutes"
                  fill="#10B981"
                  name="Break (min)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-xl">
              <Activity className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">No completed time entries yet</p>
            </div>
          )}
        </div>

        {/* Project Distribution Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Time Entries by Project
            </h2>
          </div>
          {projectDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name?.slice(0, 15)}: ${((percent || 0) * 100).toFixed(
                      0
                    )}%`
                  }
                  outerRadius={110}
                  dataKey="value"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                >
                  {projectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  wrapperStyle={{ outline: "none" }}
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "none",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                  labelStyle={{ color: "#F8FAFC" }}
                  itemStyle={{ color: "#F8FAFC" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-xl">
              <Calendar className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">No time entries yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Time Entries
          </h2>
        </div>
        <div className="space-y-3">
          {timeEntries.slice(0, 5).map((entry) => {
            const project = projects.find((p) => p.id === entry.projectId);

            if (!project) return null;

            return (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {project.name}
                    </p>
                    <p className="text-sm text-slate-600">{entry.date}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    entry.completed
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {entry.completed ? "Completed" : "Active"}
                </span>
              </div>
            );
          })}
          {timeEntries.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                No time entries yet. Start tracking your first project!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
