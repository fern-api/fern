require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.service.optional_merge_patch_test(
  requiredField: 'requiredField',
  optionalString: 'optionalString',
  optionalInteger: 1,
  optionalBoolean: true,
  nullableString: 'nullableString'
);
