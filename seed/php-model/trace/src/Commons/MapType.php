<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class MapType extends JsonSerializableType
{
    /**
     * @var mixed $keyType
     */
    #[JsonProperty('keyType')]
    public mixed $keyType;

    /**
     * @var mixed $valueType
     */
    #[JsonProperty('valueType')]
    public mixed $valueType;

    /**
     * @param array{
     *   keyType: mixed,
     *   valueType: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->keyType = $values['keyType'];
        $this->valueType = $values['valueType'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
