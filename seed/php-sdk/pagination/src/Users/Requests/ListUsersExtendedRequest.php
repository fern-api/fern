<?php

namespace Seed\Users\Requests;

class ListUsersExtendedRequest
{
    /**
     * @var ?string $cursor
     */
    public ?string $cursor;

    /**
     * @param ?string $cursor
     */
    public function __construct(
        ?string $cursor = null,
    ) {
        $this->cursor = $cursor;
    }
}
