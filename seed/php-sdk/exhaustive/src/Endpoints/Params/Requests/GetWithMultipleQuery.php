<?php

namespace Seed\Endpoints\Params\Requests;

class GetWithMultipleQuery
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
     * @param array<string> $query
     * @param array<int> $numer
     */
    public function __construct(
        array $query,
        array $numer,
    ) {
        $this->query = $query;
        $this->numer = $numer;
    }
}
