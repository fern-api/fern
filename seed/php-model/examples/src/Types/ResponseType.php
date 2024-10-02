<?php

namespace Seed\Types;

use Seed\Core\Json\SerializableType;
use Seed\BasicType;
use Seed\ComplexType;
use Seed\Core\Json\JsonProperty;

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
