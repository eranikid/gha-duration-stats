export type Workflow = {
  id: number;
  name: string;
};

export type WorkflowRun = {
  id: number;
  status: WorkflowRunStatus;
  startedAt: Date;
  conclusion: WorkflowRunConclusion | null;
};

export enum WorkflowRunStatus {
  completed = "completed",
}

export enum WorkflowRunConclusion {
  success = "success",
}

export type WorkflowRunJob = {
  name: string;
  startedAt: Date;
  completedAt: Date;
  steps: WorkflowRunJobStep[];
};

export type WorkflowRunJobStep = {
  name: string;
  startedAt: Date;
  completedAt: Date;
};

export type WorkflowRunTiming = {
  jobs: {
    name: string;
    jobDurationSeconds: number;
    steps: {
      name: string;
      stepDurationSeconds: number;
    }[];
  }[];
};
