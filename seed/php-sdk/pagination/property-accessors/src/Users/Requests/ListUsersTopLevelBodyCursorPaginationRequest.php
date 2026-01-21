<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ListUsersTopLevelBodyCursorPaginationRequest extends JsonSerializableType
{
    /**
     * The cursor used for pagination in order to fetch
     * the next page of results.
     *
     * @var ?string $cursor
     */
    #[JsonProperty('cursor')]
    private ?string $cursor;

    /**
     * @var ?string $filter An optional filter to apply to the results.
     */
    #[JsonProperty('filter')]
    private ?string $filter;

    /**
     * @param array{
     *   cursor?: ?string,
     *   filter?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->cursor = $values['cursor'] ?? null;
        $this->filter = $values['filter'] ?? null;
    }

    /**
     * @return ?string
     */
    public function getCursor(): ?string
    {
        return $this->cursor;
    }

    /**
     * @param ?string $value
     */
    public function setCursor(?string $value = null): self
    {
        $this->cursor = $value;
        return $this;
    }

    /**
     * @return ?string
     */
    public function getFilter(): ?string
    {
        return $this->filter;
    }

    /**
     * @param ?string $value
     */
    public function setFilter(?string $value = null): self
    {
        $this->filter = $value;
        return $this;
    }
}
