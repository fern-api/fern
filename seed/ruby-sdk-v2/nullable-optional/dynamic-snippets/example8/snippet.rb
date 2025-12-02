require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.test_deserialization({
  required_string: 'requiredString',
  nullable_string: 'nullableString',
  optional_string: 'optionalString',
  optional_nullable_string: 'optionalNullableString',
  nullable_list: ['nullableList', 'nullableList'],
  nullable_map: {
    nullableMap: 1
  },
  nullable_object: {
    street: 'street',
    city: 'city',
    state: 'state',
    zip_code: 'zipCode',
    country: 'country',
    building_id: 'buildingId',
    tenant_id: 'tenantId'
  },
  optional_object: {
    id: 'id',
    name: 'name',
    domain: 'domain',
    employee_count: 1
  }
});
