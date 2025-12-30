import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/useAuth";
import { projectApi, timeEntryApi, sessionApi, summaryApi } from "../api";
import type { Project, TimeEntry, Session } from "../types";
// Add these imports
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../components/Loader";
import {
  Plus,
  Folder,
  Trash2,
  Edit,
  Calendar,
  Clock,
  CheckCircle,
  Play,
  Square,
  Coffee,
  AlertCircle,
  X,
  BarChart3,
  Timer,
  PauseCircle,
  Activity,
  CalendarCheck,
  CalendarDays,
} from "lucide-react";
import { formatDate, formatTime, formatDuration } from "../utils/format";
import Alert from "../components/Alert";
import ConfirmDialog from "../components/ConfirmDialog";

const Projects: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  //const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  // Time Entry Details State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(
    null
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  //const [summary, setSummary] = useState<Summary | null>(null);
  //const [loadingSummary, setLoadingSummary] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  // At the top of your Projects component, add this state
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info" as const,
    title: "",
    message: "",
  });
  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
    duration?: number
  ) => {
    setAlert({ visible: true, type, title, message });

    // Auto-dismiss if duration provided
    if (duration) {
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, visible: false }));
      }, duration);
    }
  };
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "danger" | "warning" | "info";
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "danger",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Helper function to show confirmation
  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "warning" | "info" = "danger"
  ) => {
    setConfirmDialog({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };
  /* ================= TIMER ================= */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async () => {
      const response = await projectApi.getAll();
      return response.data.projects.filter((p) => p.userId === user?.id);
    },
    enabled: !!user?.id,
  });

  const createUpdateMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      id?: number;
    }) => {
      if (data.id) {
        return await projectApi.update(data.id, { ...data, userId: user!.id });
      } else {
        return await projectApi.create(data.name, data.description, user!.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowModal(false);
      setFormData({ name: "", description: "" });
      setEditingProject(null);
      setError("");
    },
    onError: (err: Error) => {
      setError(err.message || "Operation failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) return;

    createUpdateMutation.mutate({
      ...formData,
      id: editingProject?.id,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const timeEntriesRes = await timeEntryApi.getAll();
      const projectTimeEntries = timeEntriesRes.data.timeEntries.filter(
        (te) => te.projectId === id && te.userId === user!.id
      );

      for (const entry of projectTimeEntries) {
        try {
          await timeEntryApi.delete(entry.id, user!.id, id);
        } catch (err) {
          console.error("Error deleting time entry:", err);
        }
      }

      await projectApi.delete(id, user!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showAlert(
        "success",
        "Project Deleted",
        "Project and all associated data deleted successfully!",
        3000
      );
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (err: Error) => {
      showAlert(
        "error",
        "Delete Failed",
        err.message || "Failed to delete project"
      );
    },
  });

  const handleDelete = async (id: number) => {
    if (!user) return;
    showConfirm(
      "Delete Project",
      "Are you sure? This will delete the project and all its time entries and sessions.",
      () => deleteMutation.mutate(id),
      "danger"
    );
  };
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description });
    setShowModal(true);
  };

  const createTimeEntryMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await timeEntryApi.getAll();
      const existingEntry = response.data.timeEntries.find(
        (te) =>
          te.projectId === projectId && te.userId === user!.id && !te.completed
      );

      if (existingEntry) {
        throw new Error("Active time entry exists");
      }

      return await timeEntryApi.create(user!.id, projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showAlert("success", "Success", "Time entry created successfully!", 3000);
    },
    onError: (err: Error) => {
      if (err.message === "Active time entry exists") {
        showAlert(
          "warning",
          "Active Time Entry Exists",
          "This project already has an active time entry. Please complete it first."
        );
      } else {
        showAlert("error", "Creation Failed", "Time Entry Already Exists");
      }
    },
  });

  const handleCreateTimeEntry = (projectId: number) => {
    if (!user) return;
    createTimeEntryMutation.mutate(projectId);
  };
  /* ================= VIEW TIME ENTRY DETAILS ================= */
  /* ================= VIEW TIME ENTRY DETAILS ================= */
  const handleViewTimeEntry = async (project: Project) => {
    if (!user) return;

    try {
      const response = await timeEntryApi.getAll();
      const projectTimeEntries = response.data.timeEntries.filter(
        (te) => te.projectId === project.id && te.userId === user.id
      );

      if (projectTimeEntries.length === 0) {
        showAlert(
          "info",
          "No Entries Found",
          "No time entries found for this project"
        );
        return;
      }

      const latestEntry = projectTimeEntries[projectTimeEntries.length - 1];

      setSelectedProject(project);
      setSelectedTimeEntry(latestEntry);
      // React Query will automatically fetch sessions and summary when selectedTimeEntry is set
    } catch (err) {
      console.error("Error fetching time entry:", err);
      showAlert("error", "Load Failed", "Failed to load time entry details");
    }
  };

  const { refetch: refetchSessions } = useQuery({
    queryKey: ["sessions", selectedTimeEntry?.id],
    queryFn: async () => {
      const res = await sessionApi.getByTimeEntry(selectedTimeEntry!.id);
      const sessions = res.data.session;
      const active = sessions.find((s: Session) => s.isActive);
      setActiveSession(active || null);
      return sessions;
    },
    enabled: !!selectedTimeEntry?.id,
  });

  // // Update sessions state when data changes
  // useEffect(() => {
  //   if (sessionsData) {
  //     setSessions(sessionsData);
  //   }
  // }, [sessionsData]);

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["summary", selectedTimeEntry?.id],
    queryFn: async () => {
      try {
        const res = await summaryApi.getByTimeEntry(selectedTimeEntry!.id);
        return res.data;
      } catch (err) {
        console.error("Error fetching summary:", err);
        return null;
      }
    },
    enabled: !!selectedTimeEntry?.id && selectedTimeEntry?.completed,
  });

  const checkInMutation = useMutation({
    mutationFn: () => sessionApi.checkIn(selectedTimeEntry!.id),
    onSuccess: () => refetchSessions(),
  });

  // Check Out
  const checkOutMutation = useMutation({
    mutationFn: () =>
      sessionApi.checkOut(activeSession!.id, selectedTimeEntry!.id),
    onSuccess: () => refetchSessions(),
  });

  // Break In
  const breakInMutation = useMutation({
    mutationFn: () =>
      sessionApi.breakIn(activeSession!.id, selectedTimeEntry!.id),
    onSuccess: () => refetchSessions(),
  });

  // Break Out
  const breakOutMutation = useMutation({
    mutationFn: () =>
      sessionApi.breakOut(activeSession!.id, selectedTimeEntry!.id),
    onSuccess: () => refetchSessions(),
  });

  // Complete Entry
  const completeEntryMutation = useMutation({
    mutationFn: async () => {
      await timeEntryApi.complete(
        selectedTimeEntry!.id,
        user!.id,
        selectedTimeEntry!.projectId
      );
      const response = await timeEntryApi.getAll();
      return response.data.timeEntries.find(
        (te) => te.id === selectedTimeEntry!.id
      );
    },
    onSuccess: (updatedEntry) => {
      if (updatedEntry) {
        setSelectedTimeEntry(updatedEntry);
      }
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });

  // Update handlers
  const handleCheckIn = () => checkInMutation.mutate();
  const handleCheckOut = () => checkOutMutation.mutate();
  const handleBreakIn = () => breakInMutation.mutate();
  const handleBreakOut = () => breakOutMutation.mutate();
  const handleCompleteEntry = () => {
    if (!selectedTimeEntry || !user || activeSession) return;
    completeEntryMutation.mutate();
  };
  /* ================= TIMER CALC ================= */
  const formatTimeDisplay = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  const calculateTimers = () => {
    if (!activeSession) return { workTime: "00:00:00", breakTime: "00:00:00" };

    const start = new Date(activeSession.checkIn).getTime();
    const now = currentTime.getTime();
    const totalElapsed = Math.floor((now - start) / 1000);

    let breakSeconds = 0;
    activeSession.breaks.forEach((b) => {
      const from = new Date(b.breakIn).getTime();
      const to = b.breakOut ? new Date(b.breakOut).getTime() : now;
      breakSeconds += Math.max(0, Math.floor((to - from) / 1000));
    });

    return {
      workTime: formatTimeDisplay(totalElapsed - breakSeconds),
      breakTime: formatTimeDisplay(breakSeconds),
    };
  };

  /* ================= CALCULATE DATE METRICS ================= */
  const calculateDateMetrics = () => {
    if (!sessions || sessions.length === 0) {
      return {
        startDate: selectedTimeEntry?.date || "N/A",
        endDate: "N/A",
        totalDays: 0,
      };
    }

    const allCheckIns = sessions.map((s) => new Date(s.checkIn).getTime());
    const allCheckOuts = sessions
      .filter((s) => s.checkOut)
      .map((s) => new Date(s.checkOut!).getTime());

    const startDate = new Date(Math.min(...allCheckIns));
    const endDate =
      allCheckOuts.length > 0
        ? new Date(Math.max(...allCheckOuts))
        : new Date();

    const timeDiff = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return {
      startDate: startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      endDate: selectedTimeEntry?.completed
        ? endDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "In Progress",
      totalDays: totalDays,
    };
  };

  const { workTime, breakTime } = calculateTimers();
  const isOnBreak = activeSession?.breaks.some((b) => b.isActive);
  const dateMetrics = selectedTimeEntry ? calculateDateMetrics() : null;

  const closeTimeEntryView = () => {
    setSelectedProject(null);
    setSelectedTimeEntry(null);
    setSessions([]);
    setActiveSession(null);
    //setSummary(null);
  };

  if (projectsLoading) {
    return <Loader message="Loading projects..." />;
  }

  if (projectsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 max-w-md">
          <p className="text-rose-800 font-medium mb-2">
            Error loading projects
          </p>
          <p className="text-rose-600 text-sm">
            {(projectsError as Error)?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Project List View - ALWAYS RENDERED */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <button
            onClick={() => {
              setEditingProject(null);
              setFormData({ name: "", description: "" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
        {alert.visible && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/20 backdrop-blur-sm">
            <Alert
              title={alert.title}
              message={alert.message}
              type={alert.type}
              onDismiss={() =>
                setAlert((prev) => ({ ...prev, visible: false }))
              }
            />
          </div>
        )}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() =>
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
          }
        />
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
            <Folder className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-base font-medium text-slate-700 mb-1">
              No projects yet
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Create your first project to start tracking time
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Folder className="w-4 h-4 text-slate-600" />
                    </div>
                    <h3 className="font-medium text-slate-900">
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(project.createdAt)}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCreateTimeEntry(project.id)}
                    className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition text-xs"
                  >
                    New Entry
                  </button>
                  <button
                    onClick={() => handleViewTimeEntry(project)}
                    className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition text-xs"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - conditionally rendered */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {editingProject ? "Edit Project" : "New Project"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none bg-white text-slate-900 text-sm"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none resize-none bg-white text-slate-900 text-sm"
                  placeholder="Describe your project"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                    setFormData({ name: "", description: "" });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm"
                >
                  {editingProject ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sheet Overlay - conditionally rendered */}
      {selectedProject && selectedTimeEntry && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={closeTimeEntryView}
          />

          {/* Sheet */}
          <div className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[800px] bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform rounded-l-2xl duration-300 ease-in-out">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={closeTimeEntryView}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedProject.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedProject.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* COMPLETED TIME ENTRY - SHOW SUMMARY */}
              {selectedTimeEntry.completed ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <BarChart3 className="w-5 h-5" />
                    <h3 className="text-base font-medium">Summary</h3>
                  </div>

                  {loadingSummary ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
                    </div>
                  ) : summary ? (
                    <div className="space-y-4">
                      {/* Date Metrics */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-xs text-slate-600 mb-0.5">
                              Entry Created
                            </p>
                            <p className="font-medium text-slate-900">
                              {selectedTimeEntry.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-600 mb-0.5">
                              Entry ID
                            </p>
                            <p className="font-medium text-slate-900">
                              #{selectedTimeEntry.id}
                            </p>
                          </div>
                        </div>
                      </div>
                      {dateMetrics && (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <p className="text-xs text-slate-600">
                                Start Date
                              </p>
                            </div>
                            <p className="text-sm font-medium text-slate-900">
                              {dateMetrics.startDate}
                            </p>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                              <CalendarCheck className="w-4 h-4 text-slate-500" />
                              <p className="text-xs text-slate-600">End Date</p>
                            </div>
                            <p className="text-sm font-medium text-slate-900">
                              {dateMetrics.endDate}
                            </p>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                              <CalendarDays className="w-4 h-4 text-slate-500" />
                              <p className="text-xs text-slate-600">Duration</p>
                            </div>
                            <p className="text-sm font-medium text-slate-900">
                              {dateMetrics.totalDays}{" "}
                              {dateMetrics.totalDays === 1 ? "day" : "days"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Primary Time Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-slate-600" />
                            <p className="text-xs text-slate-600">
                              Net Work Time
                            </p>
                          </div>
                          <p className="text-2xl font-semibold text-slate-900 mb-1">
                            {formatDuration(
                              summary.Net_WorkTime.days,
                              summary.Net_WorkTime.hours,
                              summary.Net_WorkTime.minutes
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            {summary.Net_WorkTimeMinutes} minutes
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Timer className="w-4 h-4 text-slate-600" />
                            <p className="text-xs text-slate-600">Gross Time</p>
                          </div>
                          <p className="text-2xl font-semibold text-slate-900 mb-1">
                            {formatDuration(
                              summary.GrossTime.days,
                              summary.GrossTime.hours,
                              summary.GrossTime.minutes
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            {summary.GrossTimeMinutes} minutes
                          </p>
                        </div>
                      </div>

                      {/* Secondary Metrics */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <p className="text-xs text-slate-600">Sessions</p>
                          </div>
                          <p className="text-xl font-semibold text-slate-900">
                            {summary.TotalSessions}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Coffee className="w-3.5 h-3.5 text-slate-500" />
                            <p className="text-xs text-slate-600">Breaks</p>
                          </div>
                          <p className="text-xl font-semibold text-slate-900">
                            {summary.TotalBreaks}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
                            <p className="text-xs text-slate-600">Break Time</p>
                          </div>
                          <p className="text-xl font-semibold text-slate-900">
                            {summary.TotalBreakTimeMinutes}
                          </p>
                          <p className="text-xs text-slate-500">min</p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                            <p className="text-xs text-slate-600">Status</p>
                          </div>
                          <p className="text-sm font-medium text-slate-900">
                            Complete
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <AlertCircle className="w-10 h-10 mb-3" />
                      <p className="text-sm">No summary available</p>
                    </div>
                  )}
                </div>
              ) : (
                /* ACTIVE TIME ENTRY - SHOW SESSION MANAGEMENT */
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-5 h-5" />
                    <h3 className="text-base font-medium">
                      Session Management
                    </h3>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCheckIn}
                      disabled={activeSession !== null}
                      className={`w-full py-3 rounded-lg text-sm font-medium transition ${
                        activeSession
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <Play className="inline w-4 h-4 mr-2" />
                      {activeSession ? "Already Checked In" : "Check In"}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleBreakIn}
                        disabled={!activeSession || isOnBreak}
                        className={`py-2.5 rounded-lg text-sm font-medium transition ${
                          !activeSession || isOnBreak
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-slate-700 text-white hover:bg-slate-600"
                        }`}
                      >
                        <Coffee className="inline w-4 h-4 mr-1.5" />
                        Start Break
                      </button>

                      <button
                        onClick={handleBreakOut}
                        disabled={!activeSession || !isOnBreak}
                        className={`py-2.5 rounded-lg text-sm font-medium transition ${
                          !activeSession || !isOnBreak
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-slate-700 text-white hover:bg-slate-600"
                        }`}
                      >
                        <Coffee className="inline w-4 h-4 mr-1.5" />
                        End Break
                      </button>
                    </div>

                    <button
                      onClick={handleCheckOut}
                      disabled={!activeSession || isOnBreak}
                      className={`w-full py-3 rounded-lg text-sm font-medium transition ${
                        !activeSession || isOnBreak
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <Square className="inline w-4 h-4 mr-2" />
                      {isOnBreak
                        ? "End Break First"
                        : activeSession
                        ? "Check Out"
                        : "Check In First"}
                    </button>
                  </div>

                  {/* Complete Button */}
                  {sessions.length > 0 && (
                    <button
                      onClick={handleCompleteEntry}
                      disabled={activeSession !== null}
                      className={`w-full py-3 rounded-lg text-sm font-medium transition ${
                        activeSession
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <CheckCircle className="inline w-4 h-4 mr-2" />
                      {activeSession ? "Check Out First" : "Mark as Complete"}
                    </button>
                  )}

                  {/* Warning */}
                  {activeSession && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">
                        Check out before completing the time entry
                      </p>
                    </div>
                  )}

                  {/* Live Timer */}
                  {activeSession && (
                    <div className="bg-slate-900 rounded-lg p-5 text-white">
                      <p className="text-xs text-slate-400 mb-3">
                        Current Session
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">
                            Check-in
                          </p>
                          <p className="text-sm font-medium">
                            {formatTime(activeSession.checkIn)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">
                            Work Time
                          </p>
                          <p className="text-xl font-mono">{workTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">
                            Break Time
                          </p>
                          <p className="text-xl font-mono">{breakTime}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {isOnBreak ? "🔴 On Break" : "🟢 Working"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date Info */}
                  {dateMetrics && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <p className="text-xs text-slate-600">Start</p>
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          {dateMetrics.startDate}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CalendarCheck className="w-3.5 h-3.5 text-slate-500" />
                          <p className="text-xs text-slate-600">Status</p>
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          {dateMetrics.endDate}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                          <p className="text-xs text-slate-600">Days</p>
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          {dateMetrics.totalDays}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Projects;
