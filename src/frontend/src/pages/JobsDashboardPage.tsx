import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListJobs } from '../hooks/useJobs';
import { filterAndSortJobs } from '../utils/jobFiltering';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Loader2, AlertCircle, Camera, Phone } from 'lucide-react';
import { Status } from '../backend';

type StatusFilter = 'all' | Status;

function StatusBadge({ status }: { status: Status }) {
  const variants: Record<Status, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
    [Status.pending]: { variant: 'secondary', label: 'Pending' },
    [Status.in_progress]: { variant: 'default', label: 'Sent for Repair' },
    [Status.completed]: { variant: 'outline', label: 'Completed' },
  };

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function JobsDashboardPage() {
  const navigate = useNavigate();
  const { data: jobs, isLoading, isError, error } = useListJobs();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return filterAndSortJobs(jobs, searchQuery, statusFilter);
  }, [jobs, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    if (!jobs) return { total: 0, pending: 0, inProgress: 0, completed: 0 };
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === Status.pending).length,
      inProgress: jobs.filter(j => j.status === Status.in_progress).length,
      completed: jobs.filter(j => j.status === Status.completed).length,
    };
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive font-medium mb-2">Failed to load jobs</p>
        <p className="text-sm text-muted-foreground text-center">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, brand, model, mobile, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value={Status.pending}>Pending</TabsTrigger>
            <TabsTrigger value={Status.in_progress}>In Progress</TabsTrigger>
            <TabsTrigger value={Status.completed}>Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Camera className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                {jobs?.length === 0 ? 'No repair jobs yet' : 'No jobs match your search'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card
              key={job.jobId.toString()}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate({ to: '/jobs/$jobId', params: { jobId: job.jobId.toString() } })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{job.customerName}</h3>
                      <span className="text-xs text-muted-foreground">#{job.jobId.toString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {/* Mobile number not in backend, showing placeholder */}
                      Contact available
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Device:</span> {job.brand} {job.model}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    <span className="font-medium text-foreground">Issue:</span> {job.issue}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        size="lg"
        className="fixed bottom-20 right-6 rounded-full shadow-lg h-14 w-14 p-0 bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-blue-400 disabled:opacity-50"
        onClick={() => navigate({ to: '/jobs/new' })}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
