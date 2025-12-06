require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.search(
  limit: 1,
  id: 'id',
  date: '2023-01-15',
  deadline: '2024-01-15T09:30:00Z',
  bytes: 'bytes',
  user: {
    name: 'name',
    tags: ['tags', 'tags']
  },
  optional_deadline: '2024-01-15T09:30:00Z',
  key_value: {
    keyValue: 'keyValue'
  },
  optional_string: 'optionalString',
  nested_user: {
    name: 'name',
    user: {
      name: 'name',
      tags: ['tags', 'tags']
    }
  },
  optional_user: {
    name: 'name',
    tags: ['tags', 'tags']
  }
);
