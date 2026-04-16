<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;

class SearchRuleTypesRequest extends JsonSerializableType
{
    /**
     * @var ?string $query
     */
    public ?string $query;

    /**
     * @param array{
     *   query?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->query = $values['query'] ?? null;
    }
}
