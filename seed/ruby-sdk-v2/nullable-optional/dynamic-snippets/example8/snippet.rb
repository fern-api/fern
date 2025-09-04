require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.test_deserialization({
  requiredString:'requiredString',
  nullableString:'nullableString',
  optionalString:'optionalString',
  optionalNullableString:'optionalNullableString',
  nullableList:['nullableList', 'nullableList'],
  nullableMap:{
    nullableMap:1
  },
  nullableObject:{
    street:'street',
    city:'city',
    state:'state',
    zipCode:'zipCode',
    country:'country',
    buildingId:'buildingId',
    tenantId:'tenantId'
  },
  optionalObject:{
    id:'id',
    name:'name',
    domain:'domain',
    employeeCount:1
  }
});
