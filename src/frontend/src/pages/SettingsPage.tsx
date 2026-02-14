import { useListJobs } from '../hooks/useJobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { Status } from '../backend';

export default function SettingsPage() {
  const { data: jobs, isLoading, isError } = useListJobs();

  const stats = {
    total: jobs?.length || 0,
    pending: jobs?.filter((j) => j.status === Status.pending).length || 0,
    inProgress: jobs?.filter((j) => j.status === Status.in_progress).length || 0,
    completed: jobs?.filter((j) => j.status === Status.completed).length || 0,
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Application information and statistics</p>
      </div>

      <Separator />

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            SK Camera Repair
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-sm text-muted-foreground">Camera repair job tracking system</p>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="w-8 h-8 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">Failed to load statistics</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Jobs</span>
                <span className="text-lg font-bold">{stats.total}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-lg font-bold text-amber-600">{stats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-lg font-bold text-blue-600">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-lg font-bold text-green-600">{stats.completed}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 space-y-2">
        <Camera className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Designed for Camera Service Centers</p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Built with love using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'sk-repairs'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
