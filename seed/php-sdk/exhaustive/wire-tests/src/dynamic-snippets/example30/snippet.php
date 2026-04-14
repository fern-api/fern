<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithDatetimeLikeString;
use DateTime;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnWithDatetimeLikeString(
    new ObjectWithDatetimeLikeString([
        'datetimeLikeString' => '2023-08-31T14:15:22Z',
        'actualDatetime' => new DateTime('2023-08-31T14:15:22Z'),
    ]),
);
