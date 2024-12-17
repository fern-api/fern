<?php

namespace Seed\Core\Types;

use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;

abstract class DiscriminatedUnion extends JsonSerializableType
{
    /**
     * @var string type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var mixed value
     */
    public mixed $value;
}
