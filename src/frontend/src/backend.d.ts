import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type JobId = bigint;
export interface UserProfile {
    name: string;
}
export interface CameraRepairJob {
    customerName: string;
    status: Status;
    model: string;
    jobId: JobId;
    brand: string;
    issue: string;
}
export enum Status {
    pending = "pending",
    in_progress = "in_progress",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createJob(customerName: string, brand: string, model: string, issue: string): Promise<JobId>;
    deleteJob(jobId: JobId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJob(jobId: JobId): Promise<CameraRepairJob | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listJobs(): Promise<Array<CameraRepairJob>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateJob(jobId: JobId, customerName: string, brand: string, model: string, issue: string, status: Status): Promise<void>;
}
