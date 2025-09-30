require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.update_complex_profile(
  profileId: 'profileId',
  nullableRole: ,
  nullableStatus: ,
  nullableNotification: ,
  nullableSearchResult: ,
  nullableArray: ['nullableArray', 'nullableArray']
);
