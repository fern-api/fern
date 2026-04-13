<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InlineUsersUserPage extends JsonSerializableType
{
    /**
     * @var InlineUsersUserListContainer $data
     */
    #[JsonProperty('data')]
    private InlineUsersUserListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    private ?string $next;

    /**
     * @param array{
     *   data: InlineUsersUserListContainer,
     *   next?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
        $this->next = $values['next'] ?? null;
    }

    /**
     * @return InlineUsersUserListContainer
     */
    public function getData(): InlineUsersUserListContainer
    {
        return $this->data;
    }

    /**
     * @param InlineUsersUserListContainer $value
     */
    public function setData(InlineUsersUserListContainer $value): self
    {
        $this->data = $value;
        $this->_setField('data');
        return $this;
    }

    /**
     * @return ?string
     */
    public function getNext(): ?string
    {
        return $this->next;
    }

    /**
     * @param ?string $value
     */
    public function setNext(?string $value = null): self
    {
        $this->next = $value;
        $this->_setField('next');
        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
