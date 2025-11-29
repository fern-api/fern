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
      zip_code: 'zipCode',
      country: 'country',
      building_id: 'buildingId',
      tenant_id: 'tenantId'
    }
  }
);
