<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Identifier extends SerializableType
{
    /**
     * @var mixed $type
     */
    #[JsonProperty("type")]
    public mixed $type;

    /**
     * @var string $value
     */
    #[JsonProperty("value")]
    public string $value;

    /**
     * @var string $label
     */
    #[JsonProperty("label")]
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
