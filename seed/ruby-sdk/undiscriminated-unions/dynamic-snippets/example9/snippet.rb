require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.union.test_camel_case_properties(payment_method: {
  method_: 'card',
  card_number: '1234567890123456'
});
