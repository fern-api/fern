<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;

class TerminatedResponse extends JsonSerializableType
{

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
