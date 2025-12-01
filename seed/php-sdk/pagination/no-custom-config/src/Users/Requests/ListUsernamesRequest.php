<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUsernamesRequest extends JsonSerializableType
{
    /**
     * The cursor used for pagination in order to fetch
     * the next page of results.
     *
     * @var ?string $startingAfter
     */
    public ?string $startingAfter;

    /**
     * @param array{
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->startingAfter = $values['startingAfter'] ?? null;
    }
}
