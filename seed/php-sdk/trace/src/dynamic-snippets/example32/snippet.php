<?php

namespace Example;

use Seed\SeedClient;
use Seed\Playlist\Requests\UpdatePlaylistRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->playlist->updateplaylist(
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
