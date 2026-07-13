import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApplicantProvider } from "@/context/ApplicantContext";
import { JobPostingProvider } from "@/context/JobPostingContext";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import JobPostingList from "@/pages/JobPostingList";
import JobPostingDetail from "@/pages/JobPostingDetail";
import ApplicantList from "@/pages/ApplicantList";
import ApplicantDetail from "@/pages/ApplicantDetail";
import SeparateManagement from "@/pages/SeparateManagement";
import InterviewSchedule from "@/pages/InterviewSchedule";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <JobPostingProvider>
        <ApplicantProvider>
          <BrowserRouter>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/postings" element={<JobPostingList />} />
                <Route path="/postings/:id" element={<JobPostingDetail />} />
                <Route path="/applicants" element={<ApplicantList />} />
                <Route path="/applicants/:id" element={<ApplicantDetail />} />
                <Route path="/separate-management" element={<SeparateManagement />} />
                <Route path="/interviews" element={<InterviewSchedule />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminLayout>
          </BrowserRouter>
        </ApplicantProvider>
      </JobPostingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
