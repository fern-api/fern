<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InlineUsersPage extends JsonSerializableType
{
    /**
     * @var int $page The current page
     */
    #[JsonProperty('page')]
    private int $page;

    /**
     * @var ?InlineUsersNextPage $next
     */
    #[JsonProperty('next')]
    private ?InlineUsersNextPage $next;

    /**
     * @var int $perPage
     */
    #[JsonProperty('per_page')]
    private int $perPage;

    /**
     * @var int $totalPage
     */
    #[JsonProperty('total_page')]
    private int $totalPage;

    /**
     * @param array{
     *   page: int,
     *   perPage: int,
     *   totalPage: int,
     *   next?: ?InlineUsersNextPage,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->page = $values['page'];
        $this->next = $values['next'] ?? null;
        $this->perPage = $values['perPage'];
        $this->totalPage = $values['totalPage'];
    }

    /**
     * @return int
     */
    public function getPage(): int
    {
        return $this->page;
    }

    /**
     * @param int $value
     */
    public function setPage(int $value): self
    {
        $this->page = $value;
        $this->_setField('page');
        return $this;
    }

    /**
     * @return ?InlineUsersNextPage
     */
    public function getNext(): ?InlineUsersNextPage
    {
        return $this->next;
    }

    /**
     * @param ?InlineUsersNextPage $value
     */
    public function setNext(?InlineUsersNextPage $value = null): self
    {
        $this->next = $value;
        $this->_setField('next');
        return $this;
    }

    /**
     * @return int
     */
    public function getPerPage(): int
    {
        return $this->perPage;
    }

    /**
     * @param int $value
     */
    public function setPerPage(int $value): self
    {
        $this->perPage = $value;
        $this->_setField('perPage');
        return $this;
    }

    /**
     * @return int
     */
    public function getTotalPage(): int
    {
        return $this->totalPage;
    }

    /**
     * @param int $value
     */
    public function setTotalPage(int $value): self
    {
        $this->totalPage = $value;
        $this->_setField('totalPage');
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
