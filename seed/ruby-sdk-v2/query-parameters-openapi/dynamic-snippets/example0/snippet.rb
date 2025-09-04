require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.search({
  limit:1,
  id:'id',
  date:'date',
  deadline:'2024-01-15T09:30:00Z',
  bytes:'bytes',
  user:{
    name:'name',
    tags:['tags', 'tags']
  },
  optionalDeadline:'2024-01-15T09:30:00Z',
  keyValue:{
    keyValue:'keyValue'
  },
  optionalString:'optionalString',
  nestedUser:{
    name:'name',
    user:{
      name:'name',
      tags:['tags', 'tags']
    }
  },
  optionalUser:{
    name:'name',
    tags:['tags', 'tags']
  },
  neighbor:{
    name:'name',
    tags:['tags', 'tags']
  }
});
