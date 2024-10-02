<?php

namespace Seed\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class UsernameCursor extends SerializableType
{
    /**
     * @var UsernamePage $cursor
     */
    #[JsonProperty('cursor')]
    public UsernamePage $cursor;

    /**
     * @param array{
     *   cursor: UsernamePage,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->cursor = $values['cursor'];
    }
}
