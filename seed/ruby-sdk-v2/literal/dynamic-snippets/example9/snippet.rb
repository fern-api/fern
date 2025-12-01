require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.reference.send_({
  prompt: 'You are a helpful assistant',
  query: 'query',
  stream: false,
  ending: '$ending',
  context: "You're super wise",
  maybe_context: "You're super wise",
  container_object: {
    nested_objects: [{
      literal_1: 'literal1',
      literal_2: 'literal2',
      str_prop: 'strProp'
    }, {
      literal_1: 'literal1',
      literal_2: 'literal2',
      str_prop: 'strProp'
    }]
  }
});
