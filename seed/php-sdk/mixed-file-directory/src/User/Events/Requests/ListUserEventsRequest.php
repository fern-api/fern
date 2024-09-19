<?php

namespace Seed\User\Events\Requests;

class ListUserEventsRequest
{
    /**
     * @var ?int $limit The maximum number of results to return.
     */
    public ?int $limit;

    /**
     * @param ?int $limit The maximum number of results to return.
     */
    public function __construct(
        ?int $limit = null,
    ) {
        $this->limit = $limit;
    }
}
