require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.migration.get_attempted_migrations(adminKeyHeader: 'admin-key-header');
