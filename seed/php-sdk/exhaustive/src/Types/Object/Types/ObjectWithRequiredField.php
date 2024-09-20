<?php

namespace Seed\Types\Object\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ObjectWithRequiredField extends SerializableType
{
    /**
     * @var string $string
     */
    #[JsonProperty("string")]
    public string $string;

    /**
     * @param array{
     *   string: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->string = $values['string'];
    }
}
