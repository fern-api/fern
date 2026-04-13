<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InlineUsersListUsersMixedTypePaginationResponse extends JsonSerializableType
{
    /**
     * @var string $next
     */
    #[JsonProperty('next')]
    private string $next;

    /**
     * @var InlineUsersUsers $data
     */
    #[JsonProperty('data')]
    private InlineUsersUsers $data;

    /**
     * @param array{
     *   next: string,
     *   data: InlineUsersUsers,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->next = $values['next'];
        $this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function getNext(): string
    {
        return $this->next;
    }

    /**
     * @param string $value
     */
    public function setNext(string $value): self
    {
        $this->next = $value;
        $this->_setField('next');
        return $this;
    }

    /**
     * @return InlineUsersUsers
     */
    public function getData(): InlineUsersUsers
    {
        return $this->data;
    }

    /**
     * @param InlineUsersUsers $value
     */
    public function setData(InlineUsersUsers $value): self
    {
        $this->data = $value;
        $this->_setField('data');
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
