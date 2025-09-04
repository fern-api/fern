require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.update_complex_profile({
  profileId:'profileId',
  nullableArray:['nullableArray', 'nullableArray']
});
