require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.service.patch_complex(
  id: 'id',
  name: 'name',
  age: 1,
  active: true,
  metadata: {},
  tags: ['tags', 'tags'],
  email: 'email',
  nickname: 'nickname',
  bio: 'bio',
  profile_image_url: 'profileImageUrl',
  settings: {}
);
