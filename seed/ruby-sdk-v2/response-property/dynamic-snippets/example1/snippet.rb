require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.service.get_optional_movie_docs();
