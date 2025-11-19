require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.optional.send_optional_nullable_with_all_optional_properties({
  updateDraft: true
});
