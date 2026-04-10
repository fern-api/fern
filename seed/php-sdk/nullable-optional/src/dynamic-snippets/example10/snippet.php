<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\ComplexProfile;
use Seed\Types\UserRole;
use Seed\Types\UserStatus;
use Seed\Types\NotificationMethodZero;
use Seed\Types\NotificationMethodZeroType;
use Seed\Types\SearchResultZero;
use DateTime;
use Seed\Types\SearchResultZeroType;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->createcomplexprofile(
    new ComplexProfile([
        'id' => 'id',
        'nullableRole' => UserRole::Admin->value,
        'nullableStatus' => UserStatus::Active->value,
        'nullableNotification' => new NotificationMethodZero([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'type' => NotificationMethodZeroType::Email->value,
        ]),
        'nullableSearchResult' => new SearchResultZero([
            'id' => 'id',
            'username' => 'username',
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'type' => SearchResultZeroType::User->value,
        ]),
    ]),
);
