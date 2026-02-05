require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.inlined_request.send_(
  operand: '>',
  operand_or_color: 'red'
);
