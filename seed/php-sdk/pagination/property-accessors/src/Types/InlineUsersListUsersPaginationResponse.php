<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InlineUsersListUsersPaginationResponse extends JsonSerializableType
{
    /**
     * @var ?bool $hasNextPage
     */
    #[JsonProperty('hasNextPage')]
    private ?bool $hasNextPage;

    /**
     * @var ?InlineUsersPage $page
     */
    #[JsonProperty('page')]
    private ?InlineUsersPage $page;

    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    private int $totalCount;

    /**
     * @var InlineUsersUsers $data
     */
    #[JsonProperty('data')]
    private InlineUsersUsers $data;

    /**
     * @param array{
     *   totalCount: int,
     *   data: InlineUsersUsers,
     *   hasNextPage?: ?bool,
     *   page?: ?InlineUsersPage,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->hasNextPage = $values['hasNextPage'] ?? null;
        $this->page = $values['page'] ?? null;
        $this->totalCount = $values['totalCount'];
        $this->data = $values['data'];
    }

    /**
     * @return ?bool
     */
    public function getHasNextPage(): ?bool
    {
        return $this->hasNextPage;
    }

    /**
     * @param ?bool $value
     */
    public function setHasNextPage(?bool $value = null): self
    {
        $this->hasNextPage = $value;
        $this->_setField('hasNextPage');
        return $this;
    }

    /**
     * @return ?InlineUsersPage
     */
    public function getPage(): ?InlineUsersPage
    {
        return $this->page;
    }

    /**
     * @param ?InlineUsersPage $value
     */
    public function setPage(?InlineUsersPage $value = null): self
    {
        $this->page = $value;
        $this->_setField('page');
        return $this;
    }

    /**
     * @return int
     */
    public function getTotalCount(): int
    {
        return $this->totalCount;
    }

    /**
     * @param int $value
     */
    public function setTotalCount(int $value): self
    {
        $this->totalCount = $value;
        $this->_setField('totalCount');
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
