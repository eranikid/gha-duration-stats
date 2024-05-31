import { Workflow, WorkflowRun, WorkflowRunJob } from "./types.ts";

export const fetchGithubApi = async (
  url: string,
  token: string,
): Promise<Response> => {
  return await fetch(
    `https://api.github.com${url}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    },
  );
};

export const listRepositoryWorkflows = async (
  repository: string,
  token: string,
): Promise<Workflow[]> => {
  const httpResponse = await fetchGithubApi(
    `/repos/${repository}/actions/workflows`,
    token,
  );
  const rawJson = await httpResponse.json();
  return rawJson.workflows.map((workflow: any) => ({
    id: workflow.id,
    name: workflow.name,
  }));
};

export const listWorkflowRuns = async (
  repository: string,
  workflowId: number,
  page: number,
  token: string,
): Promise<WorkflowRun[]> => {
  const httpResponse = await fetchGithubApi(
    `/repos/${repository}/actions/workflows/${workflowId}/runs?page=${page}`,
    token,
  );
  const rawJson = await httpResponse.json();
  return rawJson.workflow_runs.map((run: any) => ({
    id: run.id,
    status: run.status,
    conclusion: run.conclusion,
    startedAt: new Date(run.run_started_at),
  }));
};

export const listWorkflowRunsWithPaging = async (
  repository: string,
  workflowId: number,
  after: Date,
  before: Date,
  token: string,
): Promise<WorkflowRun[]> => {
  let page = 1;
  const result = [];
  let isDone = false;
  while (!isDone) {
    console.error(`Listing workflow runs... (Page ${page})`);
    const workflowRuns = await listWorkflowRuns(
      repository,
      workflowId,
      page,
      token,
    );
    for (const run of workflowRuns) {
      if (run.startedAt < after) {
        isDone = true;
        break;
      }
      if (run.startedAt > before) {
        continue;
      }
      result.push(run);
    }
    page++;
  }
  return result;
};

export const listWorkflowRunJobs = async (
  repository: string,
  workflowRunId: number,
  token: string,
): Promise<WorkflowRunJob[]> => {
  const httpResponse = await fetchGithubApi(
    `/repos/${repository}/actions/runs/${workflowRunId}/jobs`,
    token,
  );
  const rawJson = await httpResponse.json();
  return rawJson.jobs.map((job: any) => ({
    name: job.name,
    startedAt: new Date(job.started_at),
    completedAt: new Date(job.completed_at),
    steps: job.steps.map((step: any) => ({
      name: step.name,
      startedAt: new Date(step.started_at),
      completedAt: new Date(step.completed_at),
    })),
  }));
};
