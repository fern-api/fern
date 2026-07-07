require "seed"

client = Seed::Client.new(
  username: "<username>",
  password: "<password>",
  base_url: "https://api.fern.com"
)

client.identifiers.update_profile_identifier(
  store_id: "storeId",
  profile_id: "profileId",
  id_type: "idType",
  identifier_update_id_type: "idType",
  old_value: "oldValue",
  new_value: "newValue"
)
