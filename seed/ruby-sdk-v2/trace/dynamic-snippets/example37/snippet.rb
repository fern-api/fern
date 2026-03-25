require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.v_2.v_3.problem.get_problem_version(
  problem_id: "problemId",
  problem_version: 1
)
