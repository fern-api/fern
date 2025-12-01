<?php

namespace Seed\Complex\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class SearchRequest extends JsonSerializableType
{
    /**
     * @var ?StartingAfterPaging $pagination
     */
    #[JsonProperty('pagination')]
    private ?StartingAfterPaging $pagination;

    /**
     * @var (
     *    SingleFilterSearchRequest
     *   |MultipleFilterSearchRequest
     * ) $query
     */
    #[JsonProperty('query'), Union(SingleFilterSearchRequest::class,MultipleFilterSearchRequest::class)]
    private SingleFilterSearchRequest|MultipleFilterSearchRequest $query;

    /**
     * @param array{
     *   query: (
     *    SingleFilterSearchRequest
     *   |MultipleFilterSearchRequest
     * ),
     *   pagination?: ?StartingAfterPaging,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->pagination = $values['pagination'] ?? null;$this->query = $values['query'];
    }

    /**
     * @return ?StartingAfterPaging
     */
    public function getPagination(): ?StartingAfterPaging {
        return $this->pagination;}

    /**
     * @param ?StartingAfterPaging $value
     */
    public function setPagination(?StartingAfterPaging $value = null): self {
        $this->pagination = $value;return $this;}

    /**
     * @return (
     *    SingleFilterSearchRequest
     *   |MultipleFilterSearchRequest
     * )
     */
    public function getQuery(): SingleFilterSearchRequest|MultipleFilterSearchRequest {
        return $this->query;}

    /**
     * @param (
     *    SingleFilterSearchRequest
     *   |MultipleFilterSearchRequest
     * ) $value
     */
    public function setQuery(SingleFilterSearchRequest|MultipleFilterSearchRequest $value): self {
        $this->query = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
