<?php

namespace Seed\Users\Requests;

use Seed\Core\SerializableType;

class ListUsernamesRequest extends SerializableType
{
    /**
     * @var ?string $startingAfter The cursor used for pagination in order to fetch
    the next page of results.
     */
    public ?string $startingAfter;

    /**
     * @param array{
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->startingAfter = $values['startingAfter'] ?? null;
    }
}
