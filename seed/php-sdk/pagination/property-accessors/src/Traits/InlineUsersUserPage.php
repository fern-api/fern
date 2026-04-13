<?php

namespace Seed\Traits;

use Seed\Types\InlineUsersUserListContainer;
use Seed\Core\Json\JsonProperty;

/**
 * @property InlineUsersUserListContainer $data
 * @property ?string $next
 */
trait InlineUsersUserPage
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
}
