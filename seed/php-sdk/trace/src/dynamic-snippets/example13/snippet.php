<?php

namespace Example;

use Seed\SeedClient;
use Seed\Playlist\Requests\GetPlaylistsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->playlist->getPlaylists(
    1,
    new GetPlaylistsRequest([
        'limit' => 1,
        'otherField' => 'otherField',
        'multiLineDocs' => 'multiLineDocs',
        'optionalMultipleField' => [
            'optionalMultipleField',
        ],
        'multipleField' => [
            'multipleField',
        ],
    ]),
);
