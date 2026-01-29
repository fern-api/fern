require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.union.test_camel_case_properties(payment_method: {
  method_: 'method',
  card_number: 'cardNumber'
});
