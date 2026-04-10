require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.v2problem.v2problem_get_latest_problem(problem_id: "problemId")
