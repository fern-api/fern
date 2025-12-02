require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.update_complex_profile(
  profile_id: 'profileId',
  nullable_array: ['nullableArray', 'nullableArray']
);
