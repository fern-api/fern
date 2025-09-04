require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.get_search_results({
  query:'query',
  filters:{
    filters:'filters'
  },
  includeTypes:['includeTypes', 'includeTypes']
});
