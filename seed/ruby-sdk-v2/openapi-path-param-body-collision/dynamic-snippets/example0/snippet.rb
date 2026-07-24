require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.update_profile_identifier(
  profile_id: "profile_123",
  id_type_path_param: "email",
  id_type: "phone",
  old_value: "+13175556789",
  new_value: "+13175556798"
)
