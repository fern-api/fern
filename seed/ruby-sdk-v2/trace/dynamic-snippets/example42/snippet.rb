require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.problem.getdefaultstarterfiles(
  input_params: [{
    variable_type: {
      type: "integerType"
    },
    name: "name"
  }],
  output_type: {
    type: "integerType"
  },
  method_name: "methodName"
)
