<?php

namespace Example;

use Seed\SeedClient;
use Seed\NullableOptional\Requests\UpdateComplexProfileRequest;
use Seed\NullableOptional\Types\UserRole;
use Seed\NullableOptional\Types\UserStatus;
use Seed\NullableOptional\Types\NotificationMethod;
use Seed\NullableOptional\Types\EmailNotification;
use Seed\NullableOptional\Types\SearchResult;
use Seed\NullableOptional\Types\UserResponse;
use DateTime;
use Seed\NullableOptional\Types\Address;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableOptional->updateComplexProfile(
    'profileId',
    new UpdateComplexProfileRequest([
        'nullableRole' => UserRole::Admin->value,
        'nullableStatus' => UserStatus::Active->value,
        'nullableNotification' => NotificationMethod::email(new EmailNotification([
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ])),
        'nullableSearchResult' => SearchResult::user(new UserResponse([
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
        ])),
        'nullableArray' => [
            'nullableArray',
            'nullableArray',
        ],
    ]),
);
