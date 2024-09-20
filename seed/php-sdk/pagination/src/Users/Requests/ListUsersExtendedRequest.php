<?php

namespace Seed\Users\Requests;

class ListUsersExtendedRequest
{
    /**
     * @var ?string $cursor
     */
    public ?string $cursor;

    /**
     * @param array{
     *   cursor?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->cursor = $values['cursor'] ?? null;
    }
}
