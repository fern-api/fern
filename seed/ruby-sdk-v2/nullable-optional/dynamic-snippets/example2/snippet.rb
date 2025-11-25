require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.update_user(
  'userId',
  {
    username: 'username',
    email: 'email',
    phone: 'phone',
    address: {
      street: 'street',
      city: 'city',
      state: 'state',
      zipCode: 'zipCode',
      country: 'country',
      buildingId: 'buildingId',
      tenantId: 'tenantId'
    }
  }
);
