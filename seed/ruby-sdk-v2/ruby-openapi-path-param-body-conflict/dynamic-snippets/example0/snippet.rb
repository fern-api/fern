require "seed"

client = Seed::Client.new(
  username: "<username>",
  password: "<password>",
  base_url: "https://api.fern.com"
)

client.identifiers.update_profile_identifier(
  store_id: "mem_store_00000000000000000000000000",
  profile_id: "mem_profile_00000000000000000000000000",
  id_type: "email",
  identifier_update_id_type: "phone",
  old_value: "+13175556789",
  new_value: "+13175556798"
)
