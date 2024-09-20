<?php

namespace Seed\Types;

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
     * @param array{
     *   type: mixed,
     *   value: string,
     *   label: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
        $this->label = $values['label'];
    }
}
