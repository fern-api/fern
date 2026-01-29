require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.headers.send_(
  operand: '>',
  maybe_operand: '>',
  operand_or_color: 'red'
);
