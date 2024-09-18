<?php

namespace Seed\User\Requests;

class ListUsersRequest
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
