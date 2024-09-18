<?php

namespace Seed\User\Requests;

use DateTime;
use Seed\User\Types\User;
use Seed\User\Types\NestedUser;

class GetUsersRequest
{
    /**
     * @var int $limit
     */
    public int $limit;

    /**
     * @var string $id
     */
    public string $id;

    /**
     * @var DateTime $date
     */
    public DateTime $date;

    /**
     * @var DateTime $deadline
     */
    public DateTime $deadline;

    /**
     * @var string $bytes
     */
    public string $bytes;

    /**
     * @var User $user
     */
    public User $user;

    /**
     * @var array<User> $userList
     */
    public array $userList;

    /**
     * @var ?DateTime $optionalDeadline
     */
    public ?DateTime $optionalDeadline;

    /**
     * @var array<string, string> $keyValue
     */
    public array $keyValue;

    /**
     * @var ?string $optionalString
     */
    public ?string $optionalString;

    /**
     * @var NestedUser $nestedUser
     */
    public NestedUser $nestedUser;

    /**
     * @var ?User $optionalUser
     */
    public ?User $optionalUser;

    /**
     * @var array<User> $excludeUser
     */
    public array $excludeUser;

    /**
     * @var array<string> $filter
     */
    public array $filter;

}
