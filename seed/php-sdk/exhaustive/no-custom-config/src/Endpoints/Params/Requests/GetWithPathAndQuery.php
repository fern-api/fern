<?php

namespace Seed\Endpoints\Params\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetWithPathAndQuery extends JsonSerializableType
{
    /**
     * @var string $query
     */
    public string $query;

    /**
     * @param array{
     *   query: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->query = $values['query'];
    }
}
