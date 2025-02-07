<?php

namespace Example;

use Seed\SeedClient;
use Seed\Playlist\Requests\CreatePlaylistRequest;
use Seed\Playlist\Types\PlaylistCreateRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->playlist->createPlaylist(
    1,
    new CreatePlaylistRequest([
        'datetime' => '2024-01-15T09:30:00Z',
        'optionalDatetime' => '2024-01-15T09:30:00Z',
        'body' => new PlaylistCreateRequest([
            'name' => 'name',
            'problems' => [
                'problems',
                'problems',
            ],
        ]),
    ]),
);
