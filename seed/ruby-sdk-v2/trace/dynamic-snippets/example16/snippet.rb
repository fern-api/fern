require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.storetracedworkspacev2(
  submission_id: "submissionId",
  body: [{
    submission_id: "submissionId",
    line_number: 1,
    file: {
      filename: "filename",
      directory: "directory"
    },
    stack: {
      num_stack_frames: 1
    }
  }]
)
