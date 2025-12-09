<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ListType extends JsonSerializableType
{
    /**
     * @var VariableType $valueType
     */
    #[JsonProperty('valueType')]
    public VariableType $valueType;

    /**
     * @var ?bool $isFixedLength Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
     */
    #[JsonProperty('isFixedLength')]
    public ?bool $isFixedLength;

    /**
     * @param array{
     *   valueType: VariableType,
     *   isFixedLength?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->valueType = $values['valueType'];$this->isFixedLength = $values['isFixedLength'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
