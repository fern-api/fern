require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.storetracedworkspace(
  submission_id: "submissionId",
  workspace_run_details: {
    stdout: "stdout"
  },
  trace_responses: [{
    submission_id: "submissionId",
    line_number: 1,
    stack: {
      num_stack_frames: 1
    }
  }]
)
