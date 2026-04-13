<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\User;
use Seed\Types\UserProfile;
use Seed\Types\UserProfileVerification;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createUser(
    new User([
        'id' => 'id',
        'email' => 'email',
        'password' => 'password',
        'profile' => new UserProfile([
            'name' => 'name',
            'verification' => new UserProfileVerification([
                'verified' => 'verified',
            ]),
            'ssn' => 'ssn',
        ]),
    ]),
);
