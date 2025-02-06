<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;

/**
 * This is a simple union.
 */
class Union extends JsonSerializableType
{
    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
