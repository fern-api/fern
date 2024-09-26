<?php

namespace Seed\Users\Requests;

use Seed\Core\SerializableType;

class ListUsersExtendedRequestForOptionalData extends SerializableType
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
        array $values = [],
    ) {
        $this->cursor = $values['cursor'] ?? null;
    }
}
