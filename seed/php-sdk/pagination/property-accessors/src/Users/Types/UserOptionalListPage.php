<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UserOptionalListPage extends JsonSerializableType
{
    /**
     * @var UserOptionalListContainer $data
     */
    #[JsonProperty('data')]
    private UserOptionalListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    private ?string $next;

    /**
     * @param array{
     *   data: UserOptionalListContainer,
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
     * @return UserOptionalListContainer
     */
    public function getData(): UserOptionalListContainer {
        return $this->data;}

    /**
     * @param UserOptionalListContainer $value
     */
    public function setData(UserOptionalListContainer $value): self {
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
