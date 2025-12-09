require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.path_param.send_(
  operand: '>',
  operand_or_color: 'red'
);
