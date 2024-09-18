<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Types\UsernamePage;

class UsernameCursor extends SerializableType
{
    #[JsonProperty("cursor")]
    /**
     * @var UsernamePage $cursor
     */
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
