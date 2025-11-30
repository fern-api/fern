require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.update_tags(
  user_id: 'userId',
  tags: ['tags', 'tags'],
  categories: ['categories', 'categories'],
  labels: ['labels', 'labels']
);
