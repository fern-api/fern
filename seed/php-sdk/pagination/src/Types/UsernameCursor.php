<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class UsernameCursor extends SerializableType
{
    /**
     * @var UsernamePage $cursor
     */
    #[JsonProperty("cursor")]
    public UsernamePage $cursor;

    /**
     * @param UsernamePage $cursor
     */
    public function __construct(
        UsernamePage $cursor,
    ) {
        $this->cursor = $cursor;
    }
}
