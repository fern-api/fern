<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Types\User;
use Seed\Types\NestedUser;

class UserGetUsernameRequest extends JsonSerializableType
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
     * @var ?array<User> $userList
     */
    public ?array $userList;

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
     * @var ?array<User> $excludeUser
     */
    public ?array $excludeUser;

    /**
     * @var ?array<string> $filter
     */
    public ?array $filter;

    /**
     * @var int $longParam
     */
    public int $longParam;

    /**
     * @var int $bigIntParam
     */
    public int $bigIntParam;

    /**
     * @param array{
     *   limit: int,
     *   id: string,
     *   date: DateTime,
     *   deadline: DateTime,
     *   bytes: string,
     *   user: User,
     *   keyValue: array<string, string>,
     *   nestedUser: NestedUser,
     *   longParam: int,
     *   bigIntParam: int,
     *   userList?: ?array<User>,
     *   optionalDeadline?: ?DateTime,
     *   optionalString?: ?string,
     *   optionalUser?: ?User,
     *   excludeUser?: ?array<User>,
     *   filter?: ?array<string>,
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
        $this->keyValue = $values['keyValue'];
        $this->optionalString = $values['optionalString'] ?? null;
        $this->nestedUser = $values['nestedUser'];
        $this->optionalUser = $values['optionalUser'] ?? null;
        $this->excludeUser = $values['excludeUser'] ?? null;
        $this->filter = $values['filter'] ?? null;
        $this->longParam = $values['longParam'];
        $this->bigIntParam = $values['bigIntParam'];
    }
}
