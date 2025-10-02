require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.reference.send_({
  prompt: 'You are a helpful assistant',
  stream: false,
  context: "You're super wise",
  query: 'What is the weather today',
  containerObject: {
    nestedObjects: [{
      literal1: 'literal1',
      literal2: 'literal2',
      strProp: 'strProp'
    }]
  }
});
