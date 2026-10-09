require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.update_profile_identifier(
  profile_id: "profileId",
  id_type_path_param: "idTypePathParam",
  id_type: "idType",
  old_value: "oldValue",
  new_value: "newValue"
)
