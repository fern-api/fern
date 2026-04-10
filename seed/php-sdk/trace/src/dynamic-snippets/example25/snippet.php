<?php

namespace Example;

use Seed\SeedClient;
use Seed\Playlist\Requests\PlaylistCreatePlaylistRequest;
use DateTime;
use Seed\Types\PlaylistCreateRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->playlist->createplaylist(
    1,
    new PlaylistCreatePlaylistRequest([
        'datetime' => new DateTime('2024-01-15T09:30:00Z'),
        'optionalDatetime' => new DateTime('2024-01-15T09:30:00Z'),
        'body' => new PlaylistCreateRequest([
            'name' => 'name',
            'problems' => [
                'problems',
                'problems',
            ],
        ]),
    ]),
);
