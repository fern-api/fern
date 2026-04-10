require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.playlist.getplaylists(
  service_param: 1,
  limit: 1,
  other_field: "otherField",
  multi_line_docs: "multiLineDocs"
)
