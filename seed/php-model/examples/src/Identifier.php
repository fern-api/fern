<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Identifier extends SerializableType
{
    /**
     * @var value-of<BasicType>|value-of<ComplexType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var string $value
     */
    #[JsonProperty('value')]
    public string $value;

    /**
     * @var string $label
     */
    #[JsonProperty('label')]
    public string $label;

    /**
     * @param array{
     *   type: value-of<BasicType>|value-of<ComplexType>,
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
