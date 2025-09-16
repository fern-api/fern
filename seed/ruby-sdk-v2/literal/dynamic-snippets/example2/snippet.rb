require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.inlined.send_({
  temperature:10.1,
  prompt:'You are a helpful assistant',
  context:"You're super wise",
  aliasedContext:"You're super wise",
  maybeContext:"You're super wise",
  objectWithLiteral:{
    nestedLiteral:{
      myLiteral:'How super cool'
    }
  },
  stream:false,
  query:'What is the weather today'
});
