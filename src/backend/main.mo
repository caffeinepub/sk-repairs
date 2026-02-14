import Map "mo:core/Map";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.notEqual(user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Job CRUD
  type JobId = Nat;
  type Status = { #pending; #in_progress; #completed };
  type CameraRepairJob = {
    jobId : JobId;
    customerName : Text;
    brand : Text;
    model : Text;
    issue : Text;
    status : Status;
  };

  var nextJobId = 1;

  let jobs = Map.empty<JobId, CameraRepairJob>();

  public shared ({ caller }) func createJob(customerName : Text, brand : Text, model : Text, issue : Text) : async JobId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create jobs");
    };
    let jobId = nextJobId;
    let job : CameraRepairJob = {
      jobId;
      customerName;
      brand;
      model;
      issue;
      status = #pending;
    };
    jobs.add(jobId, job);
    nextJobId += 1;
    jobId;
  };

  public query ({ caller }) func getJob(jobId : JobId) : async ?CameraRepairJob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.get(jobId);
  };

  public shared ({ caller }) func updateJob(jobId : JobId, customerName : Text, brand : Text, model : Text, issue : Text, status : Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update jobs");
    };
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?existingJob) {
        let updatedJob : CameraRepairJob = {
          jobId;
          customerName;
          brand;
          model;
          issue;
          status;
        };
        jobs.add(jobId, updatedJob);
      };
    };
  };

  public shared ({ caller }) func deleteJob(jobId : JobId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete jobs");
    };
    if (jobs.containsKey(jobId)) {
      jobs.remove(jobId);
    } else {
      Runtime.trap("Job not found");
    };
  };

  public query ({ caller }) func listJobs() : async [CameraRepairJob] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list jobs");
    };
    jobs.values().toArray();
  };
};
