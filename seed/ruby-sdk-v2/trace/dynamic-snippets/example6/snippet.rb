require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.updateworkspacesubmissionstatus(
  submission_id: "submissionId",
  type: "stopped"
)
