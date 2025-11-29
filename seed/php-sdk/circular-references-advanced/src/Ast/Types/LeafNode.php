<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;

class LeafNode extends JsonSerializableType
{

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
