require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.identifiers.update(
  id_type_path_param: "phone",
  id_type: "phone",
  old_value: "+13175556789",
  new_value: "+13175556798"
)
