<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\ComplexProfile;
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
$client->nullableoptional->createcomplexprofile(
    new ComplexProfile([
        'id' => 'id',
        'nullableRole' => UserRole::Admin->value,
        'optionalRole' => UserRole::Admin->value,
        'optionalNullableRole' => UserRole::Admin->value,
        'nullableStatus' => UserStatus::Active->value,
        'optionalStatus' => UserStatus::Active->value,
        'optionalNullableStatus' => UserStatus::Active->value,
        'nullableNotification' => new NotificationMethodZero([
            'type' => NotificationMethodZeroType::Email->value,
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ]),
        'optionalNotification' => new NotificationMethodZero([
            'type' => NotificationMethodZeroType::Email->value,
            'emailAddress' => 'emailAddress',
            'subject' => 'subject',
            'htmlContent' => 'htmlContent',
        ]),
        'optionalNullableNotification' => new NotificationMethodZero([
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
        'optionalSearchResult' => new SearchResultZero([
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
        'optionalArray' => [
            'optionalArray',
            'optionalArray',
        ],
        'optionalNullableArray' => [
            'optionalNullableArray',
            'optionalNullableArray',
        ],
        'nullableListOfNullables' => [
            'nullableListOfNullables',
            'nullableListOfNullables',
        ],
        'nullableMapOfNullables' => [
            'nullableMapOfNullables' => new Address([
                'street' => 'street',
                'city' => 'city',
                'state' => 'state',
                'zipCode' => 'zipCode',
                'country' => 'country',
                'buildingId' => 'buildingId',
                'tenantId' => 'tenantId',
            ]),
        ],
        'nullableListOfUnions' => [
            new NotificationMethodZero([
                'type' => NotificationMethodZeroType::Email->value,
                'emailAddress' => 'emailAddress',
                'subject' => 'subject',
                'htmlContent' => 'htmlContent',
            ]),
            new NotificationMethodZero([
                'type' => NotificationMethodZeroType::Email->value,
                'emailAddress' => 'emailAddress',
                'subject' => 'subject',
                'htmlContent' => 'htmlContent',
            ]),
        ],
        'optionalMapOfEnums' => [
            'optionalMapOfEnums' => UserRole::Admin->value,
        ],
    ]),
);
