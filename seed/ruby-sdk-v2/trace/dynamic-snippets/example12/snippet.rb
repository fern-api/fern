require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.storetracedtestcasev2(
  submission_id: "submissionId",
  test_case_id: "testCaseId",
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
