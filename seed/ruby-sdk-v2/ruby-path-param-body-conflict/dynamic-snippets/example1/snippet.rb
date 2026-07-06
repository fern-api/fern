require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.identifiers.update(
  id_type_path_param: "idType",
  id_type: "idType",
  old_value: "oldValue",
  new_value: "newValue"
)
