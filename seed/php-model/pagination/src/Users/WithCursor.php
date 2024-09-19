<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WithCursor extends SerializableType
{
    /**
     * @var ?string $cursor
     */
    #[JsonProperty("cursor")]
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
