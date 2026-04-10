require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.service.createbigentity(
  cast_member: {
    name: "name",
    id: "id"
  },
  extended_movie: {
    cast: %w[cast cast],
    id: "id",
    prequel: "prequel",
    title: "title",
    from: "from",
    rating: 1.1,
    type: "movie",
    tag: "tag",
    book: "book",
    metadata: {},
    revenue: 1000000
  },
  entity: {
    type: "primitive",
    name: "name"
  },
  common_metadata: {
    id: "id",
    data: {
      data: "data"
    },
    json_string: "jsonString"
  },
  event_info: {
    type: "metadata",
    id: "id",
    data: {
      data: "data"
    },
    json_string: "jsonString"
  },
  migration: {
    name: "name",
    status: "RUNNING"
  },
  exception: {
    type: "generic",
    exception_type: "exceptionType",
    exception_message: "exceptionMessage",
    exception_stacktrace: "exceptionStacktrace"
  },
  node: {
    name: "name",
    nodes: [{
      name: "name",
      nodes: [{
        name: "name"
      }, {
        name: "name"
      }],
      trees: [{}, {}]
    }, {
      name: "name",
      nodes: [{
        name: "name"
      }, {
        name: "name"
      }],
      trees: [{}, {}]
    }],
    trees: [{
      nodes: []
    }, {
      nodes: []
    }]
  },
  directory: {
    name: "name",
    files: [{
      name: "name",
      contents: "contents"
    }, {
      name: "name",
      contents: "contents"
    }],
    directories: [{
      name: "name",
      files: [],
      directories: [{
        name: "name"
      }, {
        name: "name"
      }]
    }, {
      name: "name",
      files: [],
      directories: [{
        name: "name"
      }, {
        name: "name"
      }]
    }]
  },
  moment: {
    id: "id",
    date: "2023-01-15",
    datetime: "2024-01-15T09:30:00Z"
  }
)
