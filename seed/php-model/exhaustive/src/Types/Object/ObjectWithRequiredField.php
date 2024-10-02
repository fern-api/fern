<?php

namespace Seed\Types\Object;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class ObjectWithRequiredField extends SerializableType
{
    /**
     * @var string $string
     */
    #[JsonProperty('string')]
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
