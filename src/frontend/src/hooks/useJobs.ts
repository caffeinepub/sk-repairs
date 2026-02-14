import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CameraRepairJob, JobId, Status, UserProfile } from '../backend';

export function useListJobs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CameraRepairJob[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listJobs();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetJob(jobId: JobId | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CameraRepairJob | null>({
    queryKey: ['job', jobId?.toString()],
    queryFn: async () => {
      if (!actor || !jobId) throw new Error('Actor or jobId not available');
      return actor.getJob(jobId);
    },
    enabled: !!actor && !actorFetching && jobId !== undefined,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerName: string;
      brand: string;
      model: string;
      issue: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createJob(data.customerName, data.brand, data.model, data.issue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      jobId: JobId;
      customerName: string;
      brand: string;
      model: string;
      issue: string;
      status: Status;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateJob(
        data.jobId,
        data.customerName,
        data.brand,
        data.model,
        data.issue,
        data.status
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId.toString()] });
    },
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: JobId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
