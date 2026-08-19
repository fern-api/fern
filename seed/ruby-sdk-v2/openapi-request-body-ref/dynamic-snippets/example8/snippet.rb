require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.team_member.update_team_member(
  team_member_id: "team_member_id",
  given_name: "given_name",
  family_name: "family_name",
  email_address: "email_address"
)
