import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetJob, useCreateJob, useUpdateJob } from '../hooks/useJobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { Status } from '../backend';
import { toast } from 'sonner';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: Status.pending, label: 'Pending' },
  { value: Status.in_progress, label: 'Sent for Repair' },
  { value: Status.completed, label: 'Completed' },
];

export default function JobUpsertPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const jobId = params.jobId;
  const isEditMode = !!jobId;

  const { data: existingJob, isLoading: loadingJob } = useGetJob(jobId ? BigInt(jobId) : undefined);
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const [formData, setFormData] = useState({
    customerName: '',
    brand: '',
    model: '',
    issue: '',
    status: Status.pending as Status,
  });

  useEffect(() => {
    if (existingJob) {
      setFormData({
        customerName: existingJob.customerName,
        brand: existingJob.brand,
        model: existingJob.model,
        issue: existingJob.issue,
        status: existingJob.status,
      });
    }
  }, [existingJob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && jobId) {
        await updateJob.mutateAsync({
          jobId: BigInt(jobId),
          ...formData,
        });
        toast.success('Job updated successfully');
        navigate({ to: '/jobs/$jobId', params: { jobId } });
      } else {
        const newJobId = await createJob.mutateAsync(formData);
        toast.success('Job created successfully');
        navigate({ to: '/jobs/$jobId', params: { jobId: newJobId.toString() } });
      }
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update job' : 'Failed to create job');
      console.error('Submit error:', error);
    }
  };

  if (isEditMode && loadingJob) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading job...</p>
      </div>
    );
  }

  if (isEditMode && !existingJob && !loadingJob) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive font-medium mb-2">Job not found</p>
        <Button onClick={() => navigate({ to: '/' })}>Back to Jobs</Button>
      </div>
    );
  }

  const isSubmitting = createJob.isPending || updateJob.isPending;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: isEditMode ? `/jobs/${jobId}` : '/' })}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-bold">
          {isEditMode ? `Edit Job #${jobId}` : 'New Repair Job'}
        </h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="e.g. Sadiq"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Device Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Device Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Canon"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. R6"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue">Problem Description *</Label>
              <Textarea
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                placeholder="Describe the issue..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: option.value }))}
                  className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                    formData.status === option.value
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-background text-foreground border-border hover:bg-accent'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Update Job' : 'Create Job'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
