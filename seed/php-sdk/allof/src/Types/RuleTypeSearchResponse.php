<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class RuleTypeSearchResponse extends JsonSerializableType
{
    /**
     * @var array<RuleType> $results Current page of results from the requested resource.
     */
    #[JsonProperty('results'), ArrayType([RuleType::class])]
    public array $results;

    /**
     * @var PagingCursors $paging
     */
    #[JsonProperty('paging')]
    public PagingCursors $paging;

    /**
     * @param array{
     *   results: array<RuleType>,
     *   paging: PagingCursors,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->results = $values['results'];
        $this->paging = $values['paging'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
