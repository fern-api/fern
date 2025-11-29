<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;

class ObjectValue extends JsonSerializableType
{

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
