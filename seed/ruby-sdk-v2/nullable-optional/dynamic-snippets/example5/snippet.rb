require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.create_complex_profile({
  id: 'id',
  nullableArray: ['nullableArray', 'nullableArray'],
  optionalArray: ['optionalArray', 'optionalArray'],
  optionalNullableArray: ['optionalNullableArray', 'optionalNullableArray'],
  nullableListOfNullables: ['nullableListOfNullables', 'nullableListOfNullables'],
  nullableMapOfNullables: {
    nullableMapOfNullables: {
      street: 'street',
      city: 'city',
      state: 'state',
      zipCode: 'zipCode',
      country: 'country',
      buildingId: 'buildingId',
      tenantId: 'tenantId'
    }
  },
  nullableListOfUnions: [],
  optionalMapOfEnums: {}
});
