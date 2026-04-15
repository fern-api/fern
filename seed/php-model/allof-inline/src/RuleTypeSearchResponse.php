<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class RuleTypeSearchResponse extends JsonSerializableType
{
    /**
     * @var PagingCursors $paging
     */
    #[JsonProperty('paging')]
    public PagingCursors $paging;

    /**
     * @var ?array<RuleType> $results Current page of results from the requested resource.
     */
    #[JsonProperty('results'), ArrayType([RuleType::class])]
    public ?array $results;

    /**
     * @param array{
     *   paging: PagingCursors,
     *   results?: ?array<RuleType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->paging = $values['paging'];
        $this->results = $values['results'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
