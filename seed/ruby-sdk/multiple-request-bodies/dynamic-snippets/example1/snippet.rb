require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.upload_json_document(
  author: 'author',
  tags: ['tags', 'tags'],
  title: 'title'
);
