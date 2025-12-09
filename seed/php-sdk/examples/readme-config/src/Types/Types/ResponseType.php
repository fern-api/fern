<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\BasicType;
use Seed\Types\ComplexType;
use Seed\Core\Json\JsonProperty;

class ResponseType extends JsonSerializableType
{
    /**
     * @var (
     *    value-of<BasicType>
     *   |value-of<ComplexType>
     * ) $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   type: (
     *    value-of<BasicType>
     *   |value-of<ComplexType>
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
