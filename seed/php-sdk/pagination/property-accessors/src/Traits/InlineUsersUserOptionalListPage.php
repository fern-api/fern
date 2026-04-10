<?php

namespace Seed\Traits;

use Seed\Types\InlineUsersUserOptionalListContainer;
use Seed\Core\Json\JsonProperty;

/**
 * @property InlineUsersUserOptionalListContainer $data
 * @property ?string $next
 */
trait InlineUsersUserOptionalListPage
{
    /**
     * @var InlineUsersUserOptionalListContainer $data
     */
    #[JsonProperty('data')]
    private InlineUsersUserOptionalListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    private ?string $next;

    /**
     * @return InlineUsersUserOptionalListContainer
     */
    public function getData(): InlineUsersUserOptionalListContainer
    {
        return $this->data;
    }

    /**
     * @param InlineUsersUserOptionalListContainer $value
     */
    public function setData(InlineUsersUserOptionalListContainer $value): self
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
}
