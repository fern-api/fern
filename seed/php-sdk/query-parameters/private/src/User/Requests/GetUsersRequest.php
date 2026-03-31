<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\User\Types\User;
use Seed\User\Types\NestedUser;

class GetUsersRequest extends JsonSerializableType
{
    /**
     * @var int $limit
     */
    private int $limit;

    /**
     * @var string $id
     */
    private string $id;

    /**
     * @var DateTime $date
     */
    private DateTime $date;

    /**
     * @var DateTime $deadline
     */
    private DateTime $deadline;

    /**
     * @var string $bytes
     */
    private string $bytes;

    /**
     * @var User $user
     */
    private User $user;

    /**
     * @var array<User> $userList
     */
    private array $userList;

    /**
     * @var ?DateTime $optionalDeadline
     */
    private ?DateTime $optionalDeadline;

    /**
     * @var array<string, string> $keyValue
     */
    private array $keyValue;

    /**
     * @var ?string $optionalString
     */
    private ?string $optionalString;

    /**
     * @var NestedUser $nestedUser
     */
    private NestedUser $nestedUser;

    /**
     * @var ?User $optionalUser
     */
    private ?User $optionalUser;

    /**
     * @var array<User> $excludeUser
     */
    private array $excludeUser;

    /**
     * @var array<string> $filter
     */
    private array $filter;

    /**
     * @param array{
     *   limit: int,
     *   id: string,
     *   date: DateTime,
     *   deadline: DateTime,
     *   bytes: string,
     *   user: User,
     *   userList: array<User>,
     *   keyValue: array<string, string>,
     *   nestedUser: NestedUser,
     *   excludeUser: array<User>,
     *   filter: array<string>,
     *   optionalDeadline?: ?DateTime,
     *   optionalString?: ?string,
     *   optionalUser?: ?User,
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
        $this->userList = $values['userList'];
        $this->optionalDeadline = $values['optionalDeadline'] ?? null;
        $this->keyValue = $values['keyValue'];
        $this->optionalString = $values['optionalString'] ?? null;
        $this->nestedUser = $values['nestedUser'];
        $this->optionalUser = $values['optionalUser'] ?? null;
        $this->excludeUser = $values['excludeUser'];
        $this->filter = $values['filter'];
    }

    /**
     * @return int
     */
    public function getLimit(): int
    {
        return $this->limit;
    }

    /**
     * @param int $value
     */
    public function setLimit(int $value): self
    {
        $this->limit = $value;
        $this->_setField('limit');
        return $this;
    }

    /**
     * @return string
     */
    public function getId(): string
    {
        return $this->id;
    }

    /**
     * @param string $value
     */
    public function setId(string $value): self
    {
        $this->id = $value;
        $this->_setField('id');
        return $this;
    }

    /**
     * @return DateTime
     */
    public function getDate(): DateTime
    {
        return $this->date;
    }

    /**
     * @param DateTime $value
     */
    public function setDate(DateTime $value): self
    {
        $this->date = $value;
        $this->_setField('date');
        return $this;
    }

    /**
     * @return DateTime
     */
    public function getDeadline(): DateTime
    {
        return $this->deadline;
    }

    /**
     * @param DateTime $value
     */
    public function setDeadline(DateTime $value): self
    {
        $this->deadline = $value;
        $this->_setField('deadline');
        return $this;
    }

    /**
     * @return string
     */
    public function getBytes(): string
    {
        return $this->bytes;
    }

    /**
     * @param string $value
     */
    public function setBytes(string $value): self
    {
        $this->bytes = $value;
        $this->_setField('bytes');
        return $this;
    }

    /**
     * @return User
     */
    public function getUser(): User
    {
        return $this->user;
    }

    /**
     * @param User $value
     */
    public function setUser(User $value): self
    {
        $this->user = $value;
        $this->_setField('user');
        return $this;
    }

    /**
     * @return array<User>
     */
    public function getUserList(): array
    {
        return $this->userList;
    }

    /**
     * @param array<User> $value
     */
    public function setUserList(array $value): self
    {
        $this->userList = $value;
        $this->_setField('userList');
        return $this;
    }

    /**
     * @return ?DateTime
     */
    public function getOptionalDeadline(): ?DateTime
    {
        return $this->optionalDeadline;
    }

    /**
     * @param ?DateTime $value
     */
    public function setOptionalDeadline(?DateTime $value = null): self
    {
        $this->optionalDeadline = $value;
        $this->_setField('optionalDeadline');
        return $this;
    }

    /**
     * @return array<string, string>
     */
    public function getKeyValue(): array
    {
        return $this->keyValue;
    }

    /**
     * @param array<string, string> $value
     */
    public function setKeyValue(array $value): self
    {
        $this->keyValue = $value;
        $this->_setField('keyValue');
        return $this;
    }

    /**
     * @return ?string
     */
    public function getOptionalString(): ?string
    {
        return $this->optionalString;
    }

    /**
     * @param ?string $value
     */
    public function setOptionalString(?string $value = null): self
    {
        $this->optionalString = $value;
        $this->_setField('optionalString');
        return $this;
    }

    /**
     * @return NestedUser
     */
    public function getNestedUser(): NestedUser
    {
        return $this->nestedUser;
    }

    /**
     * @param NestedUser $value
     */
    public function setNestedUser(NestedUser $value): self
    {
        $this->nestedUser = $value;
        $this->_setField('nestedUser');
        return $this;
    }

    /**
     * @return ?User
     */
    public function getOptionalUser(): ?User
    {
        return $this->optionalUser;
    }

    /**
     * @param ?User $value
     */
    public function setOptionalUser(?User $value = null): self
    {
        $this->optionalUser = $value;
        $this->_setField('optionalUser');
        return $this;
    }

    /**
     * @return array<User>
     */
    public function getExcludeUser(): array
    {
        return $this->excludeUser;
    }

    /**
     * @param array<User> $value
     */
    public function setExcludeUser(array $value): self
    {
        $this->excludeUser = $value;
        $this->_setField('excludeUser');
        return $this;
    }

    /**
     * @return array<string>
     */
    public function getFilter(): array
    {
        return $this->filter;
    }

    /**
     * @param array<string> $value
     */
    public function setFilter(array $value): self
    {
        $this->filter = $value;
        $this->_setField('filter');
        return $this;
    }
}
