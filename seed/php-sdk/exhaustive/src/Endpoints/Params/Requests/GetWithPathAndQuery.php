<?php

namespace Seed\Endpoints\Params\Requests;

class GetWithPathAndQuery
{
    /**
     * @var string $query
     */
    public string $query;

    /**
     * @param string $query
     */
    public function __construct(
        string $query,
    ) {
        $this->query = $query;
    }
}
