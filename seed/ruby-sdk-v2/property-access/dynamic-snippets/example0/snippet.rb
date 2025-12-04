require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.create_user(
  id: 'id',
  email: 'email',
  password: 'password',
  profile: {
    name: 'name',
    verification: {
      verified: 'verified'
    },
    ssn: 'ssn'
  }
);
