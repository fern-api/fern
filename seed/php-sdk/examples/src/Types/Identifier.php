<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Identifier extends SerializableType
{
    #[JsonProperty("type")]
    /**
     * @var mixed $type
     */
    public mixed $type;

    #[JsonProperty("value")]
    /**
     * @var string $value
     */
    public string $value;

    #[JsonProperty("label")]
    /**
     * @var string $label
     */
    public string $label;

    /**
     * @param mixed $type
     * @param string $value
     * @param string $label
     */
    public function __construct(
        mixed $type,
        string $value,
        string $label,
    ) {
        $this->type = $type;
        $this->value = $value;
        $this->label = $label;
    }
}
