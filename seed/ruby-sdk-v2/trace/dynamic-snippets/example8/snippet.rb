require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.sendworkspacesubmissionupdate(
  submission_id: "submissionId",
  update_time: "2024-01-15T09:30:00Z",
  update_info: {
    type: "running"
  }
)
