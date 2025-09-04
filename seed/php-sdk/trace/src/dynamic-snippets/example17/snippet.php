<?php

namespace Example;

use Seed\SeedClient;
use Seed\Playlist\Types\UpdatePlaylistRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->playlist->updatePlaylist(
    1,
    'playlistId',
    new UpdatePlaylistRequest([
        'name' => 'name',
        'problems' => [
            'problems',
            'problems',
        ],
    ]),
);
