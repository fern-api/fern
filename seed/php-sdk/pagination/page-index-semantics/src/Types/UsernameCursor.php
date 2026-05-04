<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UsernameCursor extends JsonSerializableType
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

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
