require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.submission.create_execution_session(language: 'JAVA');
