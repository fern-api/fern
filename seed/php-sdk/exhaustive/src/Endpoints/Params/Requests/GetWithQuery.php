<?php

namespace Seed\Endpoints\Params\Requests;

class GetWithQuery
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
     * @param string $query
     * @param int $number
     */
    public function __construct(
        string $query,
        int $number,
    ) {
        $this->query = $query;
        $this->number = $number;
    }
}
