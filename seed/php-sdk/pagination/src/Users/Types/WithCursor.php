<?php

namespace Seed\Users\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class WithCursor extends SerializableType
{
    /**
     * @var ?string $cursor
     */
    #[JsonProperty('cursor')]
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
