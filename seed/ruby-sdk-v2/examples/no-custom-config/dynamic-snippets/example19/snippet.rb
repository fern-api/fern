require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.service.create_big_entity({
  extended_movie: {
    cast: ['cast', 'cast'],
    id: 'id',
    prequel: 'prequel',
    title: 'title',
    from: 'from',
    rating: 1.1,
    type: 'movie',
    tag: 'tag',
    book: 'book',
    metadata: {},
    revenue: 1000000
  },
  entity: {
    name: 'name'
  },
  common_metadata: {
    id: 'id',
    data: {
      data: 'data'
    },
    json_string: 'jsonString'
  },
  migration: {
    name: 'name'
  },
  node: {
    name: 'name',
    nodes: [{
      name: 'name',
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }],
      trees: [{
        nodes: []
      }, {
        nodes: []
      }]
    }, {
      name: 'name',
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }],
      trees: [{
        nodes: []
      }, {
        nodes: []
      }]
    }],
    trees: [{
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }]
    }, {
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }]
    }]
  },
  directory: {
    name: 'name',
    files: [{
      name: 'name',
      contents: 'contents'
    }, {
      name: 'name',
      contents: 'contents'
    }],
    directories: [{
      name: 'name',
      files: [{
        name: 'name',
        contents: 'contents'
      }, {
        name: 'name',
        contents: 'contents'
      }],
      directories: [{
        name: 'name',
        files: [],
        directories: []
      }, {
        name: 'name',
        files: [],
        directories: []
      }]
    }, {
      name: 'name',
      files: [{
        name: 'name',
        contents: 'contents'
      }, {
        name: 'name',
        contents: 'contents'
      }],
      directories: [{
        name: 'name',
        files: [],
        directories: []
      }, {
        name: 'name',
        files: [],
        directories: []
      }]
    }]
  },
  moment: {
    id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    date: '2023-01-15',
    datetime: '2024-01-15T09:30:00Z'
  }
});
