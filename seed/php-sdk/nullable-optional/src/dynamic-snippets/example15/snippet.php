<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\NullableOptionalUpdateComplexProfileRequest;
use Seed\Types\UserRole;
use Seed\Types\UserStatus;
use Seed\Types\NotificationMethodZero;
use Seed\Types\NotificationMethodZeroType;
use Seed\Types\SearchResultZero;
use Seed\Types\SearchResultZeroType;
use DateTime;
use Seed\Types\Address;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->updatecomplexprofile(
    'profileId',
    new NullableOptionalUpdateComplexProfileRequest([
        'nullableRole' => UserRole::Admin->value,
        'nullableStatus' => UserStatus::Active->value,
        'nullableNotification' => new NotificationMethodZero([
            'type' => NotificationMethodZeroType::Email->value,
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ]),
        'nullableSearchResult' => new SearchResultZero([
            'type' => SearchResultZeroType::User->value,
            'id' => 'id',
            'username' => 'username',
            'email' => 'email',
            'phone' => 'phone',
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
            'address' => new Address([
                'street' => 'street',
                'city' => 'city',
                'state' => 'state',
                'zipCode' => 'zipCode',
                'country' => 'country',
                'buildingId' => 'buildingId',
                'tenantId' => 'tenantId',
            ]),
        ]),
        'nullableArray' => [
            'nullableArray',
            'nullableArray',
        ],
    ]),
);
