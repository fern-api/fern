<?php

namespace Seed\Core\Types;

use Seed\Core\Json\JsonSerializableType;

abstract class DiscriminatedUnion extends JsonSerializableType
{
    /**
     * @var string type
     */
    public string $type;

    /**
     * @var mixed value
     */
    public mixed $value;
}
