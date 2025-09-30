require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.update_tags(
  userId: 'userId',
  tags: ['tags', 'tags'],
  categories: ['categories', 'categories'],
  labels: ['labels', 'labels']
);
