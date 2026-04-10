require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.playlist.updateplaylist(
  service_param: 1,
  playlist_id: "playlistId",
  name: "name",
  problems: ["problems"]
)
