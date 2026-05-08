<?php

namespace Seed\Endpoints\Params\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetWithAllowMultipleQueryParamsRequest extends JsonSerializableType
{
    /**
     * @var ?array<string> $query
     */
    public ?array $query;

    /**
     * @var ?array<int> $number
     */
    public ?array $number;

    /**
     * @param array{
     *   query?: ?array<string>,
     *   number?: ?array<int>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->query = $values['query'] ?? null;
        $this->number = $values['number'] ?? null;
    }
}
