<?php

namespace Seed\Endpoints\Params\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetWithMultipleQuery extends JsonSerializableType
{
    /**
     * @var array<string> $query
     */
    public array $query;

    /**
     * @var array<int> $numer
     */
    public array $numer;

    /**
     * @param array{
     *   query: array<string>,
     *   numer: array<int>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->query = $values['query'];
        $this->numer = $values['numer'];
    }
}
