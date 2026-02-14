import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetJob, useDeleteJob } from '../hooks/useJobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, Edit2, Trash2, Loader2, AlertCircle, Camera } from 'lucide-react';
import { Status } from '../backend';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: Status }) {
  const variants: Record<Status, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
    [Status.pending]: { variant: 'secondary', label: 'Pending' },
    [Status.in_progress]: { variant: 'default', label: 'Sent for Repair' },
    [Status.completed]: { variant: 'outline', label: 'Completed' },
  };

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function JobDetailsPage() {
  const navigate = useNavigate();
  const { jobId } = useParams({ from: '/jobs/$jobId' });
  const { data: job, isLoading, isError, error } = useGetJob(BigInt(jobId));
  const deleteJob = useDeleteJob();

  const handleDelete = async () => {
    try {
      await deleteJob.mutateAsync(BigInt(jobId));
      toast.success('Job deleted successfully');
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to delete job');
      console.error('Delete error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive font-medium mb-2">Failed to load job</p>
        <p className="text-sm text-muted-foreground text-center mb-4">
          {error instanceof Error ? error.message : 'Job not found'}
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/jobs/$jobId/edit', params: { jobId } })}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Job Header Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{job.customerName}</h1>
              <p className="text-slate-300 text-sm">Job #{job.jobId.toString()}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>
        </CardContent>
      </Card>

      {/* Device Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Brand & Model</p>
            <p className="text-lg font-medium">{job.brand} {job.model}</p>
          </div>
        </CardContent>
      </Card>

      {/* Issue Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Problem Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
            {job.issue}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Job
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this repair job. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
