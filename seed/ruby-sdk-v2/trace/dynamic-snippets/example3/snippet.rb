require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.updatetestsubmissionstatus(submission_id: "submissionId")
