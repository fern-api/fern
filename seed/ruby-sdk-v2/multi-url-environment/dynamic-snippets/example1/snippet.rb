require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.s_3.get_presigned_url({
  s3Key:'s3Key'
});
