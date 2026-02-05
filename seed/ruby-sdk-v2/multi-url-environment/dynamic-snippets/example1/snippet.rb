require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.s_3.get_presigned_url(s_3_key: 's3Key');
