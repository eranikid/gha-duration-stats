import { config } from "./config.ts";
import {
  listRepositoryWorkflows,
  listWorkflowRunJobs,
  listWorkflowRunsWithPaging,
} from "./githubApi.ts";
import { formatKqlTable } from "./kustoFormat.ts";
import {
  WorkflowRunConclusion,
  WorkflowRunStatus,
  WorkflowRunTiming,
} from "./types.ts";

if (!config.authToken) {
  throw new Error("Please provide ${GH_TOKEN} env var");
}

console.error("Getting workflow list...");
const workflows = await listRepositoryWorkflows(
  config.repository,
  config.authToken,
);
const workflow = workflows.find((workflow) =>
  workflow.name == config.workflowName
);
if (workflow === undefined) {
  throw new Error(
    `Workflow '${config.workflowName}' was not found in repository '${config.repository}'`,
  );
}
console.error("Listing workflow runs...");
const runs = await listWorkflowRunsWithPaging(
  config.repository,
  workflow.id,
  config.scanAfter,
  config.scanBefore,
  config.authToken,
);

const timings: WorkflowRunTiming[] = [];
let runsFetched = 0;
for (let i = 0; i < runs.length; i++) {
  const run = runs[i];
  if (
    run.status != WorkflowRunStatus.completed ||
    run.conclusion != WorkflowRunConclusion.success
  ) {
    continue;
  }

  if (runsFetched++ % 10 == 0) {
    console.error(`Fetching workflow run jobs... (${i + 1}/${runs.length})`);
  }
  const jobs = await listWorkflowRunJobs(
    config.repository,
    run.id,
    config.authToken,
  );
  const runTiming: WorkflowRunTiming = {
    jobs: jobs.map((job) => ({
      name: job.name,
      jobDurationSeconds:
        (job.completedAt.getTime() - job.startedAt.getTime()) / 1000,
      steps: job.steps.map((step) => ({
        name: step.name,
        stepDurationSeconds:
          (step.completedAt.getTime() - step.startedAt.getTime()) / 1000,
      })),
    })),
  };
  timings.push(runTiming);
}

console.log(formatKqlTable(timings));