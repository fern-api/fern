<?php

namespace Seed\NullableOptional\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class SearchRequest extends JsonSerializableType
{
    /**
     * @var string $query
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @var ?array<string, ?string> $filters
     */
    #[JsonProperty('filters'), ArrayType(['string' => new Union('string', 'null')])]
    public ?array $filters;

    /**
     * @var ?array<string> $includeTypes
     */
    #[JsonProperty('includeTypes'), ArrayType(['string'])]
    public ?array $includeTypes;

    /**
     * @param array{
     *   query: string,
     *   filters?: ?array<string, ?string>,
     *   includeTypes?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->query = $values['query'];$this->filters = $values['filters'] ?? null;$this->includeTypes = $values['includeTypes'] ?? null;
    }
}
