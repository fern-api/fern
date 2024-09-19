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
     * @var array<string, string> $keyValue
     */
    public array $keyValue;

    /**
     * @var NestedUser $nestedUser
     */
    public NestedUser $nestedUser;

    /**
     * @var array<User> $excludeUser
     */
    public array $excludeUser;

    /**
     * @var array<string> $filter
     */
    public array $filter;

    /**
     * @var ?DateTime $optionalDeadline
     */
    public ?DateTime $optionalDeadline;

    /**
     * @var ?string $optionalString
     */
    public ?string $optionalString;

    /**
     * @var ?User $optionalUser
     */
    public ?User $optionalUser;

    /**
     * @param int $limit
     * @param string $id
     * @param DateTime $date
     * @param DateTime $deadline
     * @param string $bytes
     * @param User $user
     * @param array<User> $userList
     * @param array<string, string> $keyValue
     * @param NestedUser $nestedUser
     * @param array<User> $excludeUser
     * @param array<string> $filter
     * @param ?DateTime $optionalDeadline
     * @param ?string $optionalString
     * @param ?User $optionalUser
     */
    public function __construct(
        int $limit,
        string $id,
        DateTime $date,
        DateTime $deadline,
        string $bytes,
        User $user,
        array $userList,
        array $keyValue,
        NestedUser $nestedUser,
        array $excludeUser,
        array $filter,
        ?DateTime $optionalDeadline = null,
        ?string $optionalString = null,
        ?User $optionalUser = null,
    ) {
        $this->limit = $limit;
        $this->id = $id;
        $this->date = $date;
        $this->deadline = $deadline;
        $this->bytes = $bytes;
        $this->user = $user;
        $this->userList = $userList;
        $this->keyValue = $keyValue;
        $this->nestedUser = $nestedUser;
        $this->excludeUser = $excludeUser;
        $this->filter = $filter;
        $this->optionalDeadline = $optionalDeadline;
        $this->optionalString = $optionalString;
        $this->optionalUser = $optionalUser;
    }
}
