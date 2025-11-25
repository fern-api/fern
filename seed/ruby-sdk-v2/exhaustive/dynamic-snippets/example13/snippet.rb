require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.endpoints.http_methods.test_patch(
  'id',
  {
    string: 'string',
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: '2024-01-15T09:30:00Z',
    date: '2023-01-15',
    uuid: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    base64: 'SGVsbG8gd29ybGQh',
    list: ['list', 'list'],
    set: Set.new(['set']),
    map: {
      1: 'map'
    },
    bigint: '1000000'
  }
);
