require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable.create_user(
  username: 'username',
  tags: ['tags', 'tags'],
  metadata: {
    created_at: '2024-01-15T09:30:00Z',
    updated_at: '2024-01-15T09:30:00Z',
    avatar: 'avatar',
    activated: true,
    values: {
      values: 'values'
    }
  },
  avatar: 'avatar'
);
