<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UserPage extends JsonSerializableType
{
    /**
     * @var UserListContainer $data
     */
    #[JsonProperty('data')]
    private UserListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    private ?string $next;

    /**
     * @param array{
     *   data: UserListContainer,
     *   next?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->data = $values['data'];$this->next = $values['next'] ?? null;
    }

    /**
     * @return UserListContainer
     */
    public function getData(): UserListContainer {
        return $this->data;}

    /**
     * @param UserListContainer $value
     */
    public function setData(UserListContainer $value): self {
        $this->data = $value;return $this;}

    /**
     * @return ?string
     */
    public function getNext(): ?string {
        return $this->next;}

    /**
     * @param ?string $value
     */
    public function setNext(?string $value = null): self {
        $this->next = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
