<?php

namespace Seed\Complex;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class SearchRequest extends JsonSerializableType
{
    /**
     * @var ?StartingAfterPaging $pagination
     */
    #[JsonProperty('pagination')]
    public ?StartingAfterPaging $pagination;

    /**
     * @var (
     *    SingleFilterSearchRequest
     *   |MultipleFilterSearchRequest
     * ) $query
     */
    #[JsonProperty('query'), Union(SingleFilterSearchRequest::class,MultipleFilterSearchRequest::class)]
    public SingleFilterSearchRequest|MultipleFilterSearchRequest $query;

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
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
