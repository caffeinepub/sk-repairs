import type { CameraRepairJob, Status } from '../backend';

type StatusFilter = 'all' | Status;

export function filterAndSortJobs(
  jobs: CameraRepairJob[],
  searchQuery: string,
  statusFilter: StatusFilter
): CameraRepairJob[] {
  let filtered = [...jobs];

  // Apply status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter((job) => job.status === statusFilter);
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((job) => {
      return (
        job.customerName.toLowerCase().includes(query) ||
        job.brand.toLowerCase().includes(query) ||
        job.model.toLowerCase().includes(query) ||
        job.issue.toLowerCase().includes(query) ||
        job.jobId.toString().includes(query)
      );
    });
  }

  // Sort by jobId descending (newest first)
  filtered.sort((a, b) => Number(b.jobId - a.jobId));

  return filtered;
}
