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
    )
    {
        $this->limit = $values['limit'];$this->id = $values['id'];$this->date = $values['date'];$this->deadline = $values['deadline'];$this->bytes = $values['bytes'];$this->user = $values['user'];$this->userList = $values['userList'];$this->optionalDeadline = $values['optionalDeadline'] ?? null;$this->keyValue = $values['keyValue'];$this->optionalString = $values['optionalString'] ?? null;$this->nestedUser = $values['nestedUser'];$this->optionalUser = $values['optionalUser'] ?? null;$this->excludeUser = $values['excludeUser'];$this->filter = $values['filter'];
    }

    /**
     * @return int
     */
    public function getLimit(): int {
        return $this->limit;}

    /**
     * @param int $value
     */
    public function setLimit(int $value): self {
        $this->limit = $value;return $this;}

    /**
     * @return string
     */
    public function getId(): string {
        return $this->id;}

    /**
     * @param string $value
     */
    public function setId(string $value): self {
        $this->id = $value;return $this;}

    /**
     * @return DateTime
     */
    public function getDate(): DateTime {
        return $this->date;}

    /**
     * @param DateTime $value
     */
    public function setDate(DateTime $value): self {
        $this->date = $value;return $this;}

    /**
     * @return DateTime
     */
    public function getDeadline(): DateTime {
        return $this->deadline;}

    /**
     * @param DateTime $value
     */
    public function setDeadline(DateTime $value): self {
        $this->deadline = $value;return $this;}

    /**
     * @return string
     */
    public function getBytes(): string {
        return $this->bytes;}

    /**
     * @param string $value
     */
    public function setBytes(string $value): self {
        $this->bytes = $value;return $this;}

    /**
     * @return User
     */
    public function getUser(): User {
        return $this->user;}

    /**
     * @param User $value
     */
    public function setUser(User $value): self {
        $this->user = $value;return $this;}

    /**
     * @return array<User>
     */
    public function getUserList(): array {
        return $this->userList;}

    /**
     * @param array<User> $value
     */
    public function setUserList(array $value): self {
        $this->userList = $value;return $this;}

    /**
     * @return ?DateTime
     */
    public function getOptionalDeadline(): ?DateTime {
        return $this->optionalDeadline;}

    /**
     * @param ?DateTime $value
     */
    public function setOptionalDeadline(?DateTime $value = null): self {
        $this->optionalDeadline = $value;return $this;}

    /**
     * @return array<string, string>
     */
    public function getKeyValue(): array {
        return $this->keyValue;}

    /**
     * @param array<string, string> $value
     */
    public function setKeyValue(array $value): self {
        $this->keyValue = $value;return $this;}

    /**
     * @return ?string
     */
    public function getOptionalString(): ?string {
        return $this->optionalString;}

    /**
     * @param ?string $value
     */
    public function setOptionalString(?string $value = null): self {
        $this->optionalString = $value;return $this;}

    /**
     * @return NestedUser
     */
    public function getNestedUser(): NestedUser {
        return $this->nestedUser;}

    /**
     * @param NestedUser $value
     */
    public function setNestedUser(NestedUser $value): self {
        $this->nestedUser = $value;return $this;}

    /**
     * @return ?User
     */
    public function getOptionalUser(): ?User {
        return $this->optionalUser;}

    /**
     * @param ?User $value
     */
    public function setOptionalUser(?User $value = null): self {
        $this->optionalUser = $value;return $this;}

    /**
     * @return array<User>
     */
    public function getExcludeUser(): array {
        return $this->excludeUser;}

    /**
     * @param array<User> $value
     */
    public function setExcludeUser(array $value): self {
        $this->excludeUser = $value;return $this;}

    /**
     * @return array<string>
     */
    public function getFilter(): array {
        return $this->filter;}

    /**
     * @param array<string> $value
     */
    public function setFilter(array $value): self {
        $this->filter = $value;return $this;}
}
