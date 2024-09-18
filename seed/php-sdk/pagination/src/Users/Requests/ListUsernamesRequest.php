<?php

namespace Seed\Users\Requests;

class ListUsernamesRequest
{
    /**
     * @var ?string $startingAfter The cursor used for pagination in order to fetch
    the next page of results.
     */
    public ?string $startingAfter;

}
