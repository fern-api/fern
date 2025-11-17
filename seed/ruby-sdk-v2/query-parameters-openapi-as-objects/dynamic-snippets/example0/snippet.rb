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
  userList: ,
  optionalDeadline: '2024-01-15T09:30:00Z',
  keyValue: {
    keyValue: 'keyValue'
  },
  optionalString: 'optionalString',
  nestedUser: {
    name: 'name',
    user: {
      name: 'name',
      tags: ['tags', 'tags']
    }
  },
  optionalUser: {
    name: 'name',
    tags: ['tags', 'tags']
  },
  excludeUser: ,
  filter: ,
  neighbor: ,
  neighborRequired: 
);
