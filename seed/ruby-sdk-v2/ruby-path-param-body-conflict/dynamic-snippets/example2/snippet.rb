require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.identifiers.patch_metadata(
  id_type_path_param: "phone",
  label: "primary"
)
