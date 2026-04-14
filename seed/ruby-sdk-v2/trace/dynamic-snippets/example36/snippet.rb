require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.v2.v3.problem.get_latest_problem(problem_id: "problemId")
