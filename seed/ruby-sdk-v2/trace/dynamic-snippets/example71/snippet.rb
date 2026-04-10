require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.v2v3problem.v2v3problem_get_problem_version(
  problem_id: "problemId",
  problem_version: 1
)
