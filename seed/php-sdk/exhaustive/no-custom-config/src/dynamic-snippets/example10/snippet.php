<?php

namespace Example;

use Seed\SeedClient;
use Seed\Reqwithheaders\Requests\GetwithcustomheaderReqwithheadersRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->reqwithheaders->getwithcustomheader(
    new GetwithcustomheaderReqwithheadersRequest([
        'testEndpointHeader' => 'testEndpointHeader',
        'body' => 'string',
    ]),
);
