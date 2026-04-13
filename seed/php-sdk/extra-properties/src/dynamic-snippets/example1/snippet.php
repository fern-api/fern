<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserCreateUserRequest;
use Seed\User\Types\UserCreateUserRequestType;
use Seed\User\Types\UserCreateUserRequestVersion;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createuser(
    new UserCreateUserRequest([
        'type' => UserCreateUserRequestType::CreateUserRequest->value,
        'version' => UserCreateUserRequestVersion::V1->value,
        'name' => 'name',
    ]),
);
