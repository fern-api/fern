<?php

namespace Seed\Inlined\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ATopLevelLiteral extends JsonSerializableType
{
    /**
     * @var ANestedLiteral $nestedLiteral
     */
    #[JsonProperty('nestedLiteral')]
    public ANestedLiteral $nestedLiteral;

    /**
     * @param array{
     *   nestedLiteral: ANestedLiteral,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->nestedLiteral = $values['nestedLiteral'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
