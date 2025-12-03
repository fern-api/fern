<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class SearchResourcesRequest extends JsonSerializableType
{
    /**
     * @var int $limit Maximum results to return
     */
    public int $limit;

    /**
     * @var int $offset Offset for pagination
     */
    public int $offset;

    /**
     * @var ?string $query Search query text
     */
    #[JsonProperty('query')]
    public ?string $query;

    /**
     * @var ?array<string, mixed> $filters
     */
    #[JsonProperty('filters'), ArrayType(['string' => 'mixed'])]
    public ?array $filters;

    /**
     * @param array{
     *   limit: int,
     *   offset: int,
     *   query?: ?string,
     *   filters?: ?array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->limit = $values['limit'];$this->offset = $values['offset'];$this->query = $values['query'] ?? null;$this->filters = $values['filters'] ?? null;
    }
}
