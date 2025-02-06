<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;

class UnionWithTime extends JsonSerializableType
{
    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
