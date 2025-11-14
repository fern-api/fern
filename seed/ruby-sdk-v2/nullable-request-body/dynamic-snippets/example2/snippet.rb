require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.test_group.test_method_name(
  pathParam: 'path_param',
  queryParamObject: {
    id: 'id',
    name: 'name'
  },
  queryParamInteger: 1
);
