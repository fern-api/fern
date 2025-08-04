<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Types\User;
use Seed\Types\NestedUser;

class SearchRequest extends JsonSerializableType
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
     * @var string $date
     */
    public string $date;

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
     * @var ?array<User> $userList
     */
    public ?array $userList;

    /**
     * @var ?DateTime $optionalDeadline
     */
    public ?DateTime $optionalDeadline;

    /**
     * @var ?array<string, ?string> $keyValue
     */
    public ?array $keyValue;

    /**
     * @var ?string $optionalString
     */
    public ?string $optionalString;

    /**
     * @var ?NestedUser $nestedUser
     */
    public ?NestedUser $nestedUser;

    /**
     * @var ?User $optionalUser
     */
    public ?User $optionalUser;

    /**
     * @var ?array<User> $excludeUser
     */
    public ?array $excludeUser;

    /**
     * @var ?array<string> $filter
     */
    public ?array $filter;

    /**
     * @var ?User $neighbor
     */
    public ?User $neighbor;

    /**
     * @var (
     *    User
     *   |NestedUser
     *   |string
     *   |int
     * ) $neighborRequired
     */
    public User|NestedUser|string|int $neighborRequired;

    /**
     * @param array{
     *   limit: int,
     *   id: string,
     *   date: string,
     *   deadline: DateTime,
     *   bytes: string,
     *   user: User,
     *   neighborRequired: (
     *    User
     *   |NestedUser
     *   |string
     *   |int
     * ),
     *   userList?: ?array<User>,
     *   optionalDeadline?: ?DateTime,
     *   keyValue?: ?array<string, ?string>,
     *   optionalString?: ?string,
     *   nestedUser?: ?NestedUser,
     *   optionalUser?: ?User,
     *   excludeUser?: ?array<User>,
     *   filter?: ?array<string>,
     *   neighbor?: ?User,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->limit = $values['limit'];
        $this->id = $values['id'];
        $this->date = $values['date'];
        $this->deadline = $values['deadline'];
        $this->bytes = $values['bytes'];
        $this->user = $values['user'];
        $this->userList = $values['userList'] ?? null;
        $this->optionalDeadline = $values['optionalDeadline'] ?? null;
        $this->keyValue = $values['keyValue'] ?? null;
        $this->optionalString = $values['optionalString'] ?? null;
        $this->nestedUser = $values['nestedUser'] ?? null;
        $this->optionalUser = $values['optionalUser'] ?? null;
        $this->excludeUser = $values['excludeUser'] ?? null;
        $this->filter = $values['filter'] ?? null;
        $this->neighbor = $values['neighbor'] ?? null;
        $this->neighborRequired = $values['neighborRequired'];
    }
}
