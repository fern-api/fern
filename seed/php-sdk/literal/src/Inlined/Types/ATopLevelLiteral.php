<?php

namespace Seed\Inlined\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class ATopLevelLiteral extends SerializableType
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
    ) {
        $this->nestedLiteral = $values['nestedLiteral'];
    }
}
