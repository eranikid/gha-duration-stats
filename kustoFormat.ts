import { WorkflowRunTiming } from "./types.ts";

const escapeForKusto = (input: string): string => input.replaceAll('"', '\\"');

export const formatKqlTable = (timings: WorkflowRunTiming[]): string => {
  const parts = [];
  parts.push(
    "let Timings = datatable(JobName: string, JobDurationSeconds: int, StepName: string, StepDurationSeconds: int) [",
  );
  for (const timing of timings) {
    for (const job of timing.jobs) {
      for (const step of job.steps) {
        parts.push(
          `\"${escapeForKusto(job.name)}\", ${job.jobDurationSeconds}, \"${
            escapeForKusto(step.name)
          }\", ${step.stepDurationSeconds},`,
        );
      }
    }
  }
  parts.push("];");

  return parts.join("\n");
};
