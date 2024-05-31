export const config = {
  workflowName: "Build",
  repository: "dodopizza/labelprinter-desktop",
  authToken: Deno.env.get("GH_TOKEN"),
  scanAfter: new Date(2024, 4, 23),
  scanBefore: new Date(2024, 5, 1),
};
