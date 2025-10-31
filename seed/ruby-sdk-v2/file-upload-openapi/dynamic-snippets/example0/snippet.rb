require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.file_upload_example.upload_file();
