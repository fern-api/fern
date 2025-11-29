<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class MapType extends JsonSerializableType
{
    /**
     * @var VariableType $keyType
     */
    #[JsonProperty('keyType')]
    public VariableType $keyType;

    /**
     * @var VariableType $valueType
     */
    #[JsonProperty('valueType')]
    public VariableType $valueType;

    /**
     * @param array{
     *   keyType: VariableType,
     *   valueType: VariableType,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->keyType = $values['keyType'];$this->valueType = $values['valueType'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
