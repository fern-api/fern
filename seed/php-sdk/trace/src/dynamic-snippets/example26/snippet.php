<?php

namespace Example;

use Seed\SeedClient;
use Seed\Playlist\Requests\PlaylistGetPlaylistsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->playlist->getplaylists(
    1,
    new PlaylistGetPlaylistsRequest([
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
