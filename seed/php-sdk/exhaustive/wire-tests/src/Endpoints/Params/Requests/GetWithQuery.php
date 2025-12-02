<?php

namespace Seed\Endpoints\Params\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetWithQuery extends JsonSerializableType
{
    /**
     * @var string $query
     */
    public string $query;

    /**
     * @var int $number
     */
    public int $number;

    /**
     * @param array{
     *   query: string,
     *   number: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->query = $values['query'];$this->number = $values['number'];
    }
}
