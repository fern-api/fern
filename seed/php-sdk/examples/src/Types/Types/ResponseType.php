<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Types\BasicType;
use Seed\Types\ComplexType;
use Seed\Core\JsonProperty;

class ResponseType extends SerializableType
{
    /**
     * @var value-of<BasicType>|value-of<ComplexType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   type: value-of<BasicType>|value-of<ComplexType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
    }
}
