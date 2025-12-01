require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.create_complex_profile({
  id: 'id',
  nullable_array: ['nullableArray', 'nullableArray'],
  optional_array: ['optionalArray', 'optionalArray'],
  optional_nullable_array: ['optionalNullableArray', 'optionalNullableArray'],
  nullable_list_of_nullables: ['nullableListOfNullables', 'nullableListOfNullables'],
  nullable_map_of_nullables: {
    nullableMapOfNullables: {
      street: 'street',
      city: 'city',
      state: 'state',
      zip_code: 'zipCode',
      country: 'country',
      building_id: 'buildingId',
      tenant_id: 'tenantId'
    }
  },
  nullable_list_of_unions: [],
  optional_map_of_enums: {}
});
