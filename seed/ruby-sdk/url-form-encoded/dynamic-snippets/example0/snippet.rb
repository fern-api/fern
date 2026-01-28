require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.submit_form_data(
  username: 'johndoe',
  email: 'john@example.com'
);
