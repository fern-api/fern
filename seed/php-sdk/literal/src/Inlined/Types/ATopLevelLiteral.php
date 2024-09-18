<?php

namespace Seed\Inlined\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Inlined\Types\ANestedLiteral;

class ATopLevelLiteral extends SerializableType
{
    #[JsonProperty("nestedLiteral")]
    /**
     * @var ANestedLiteral $nestedLiteral
     */
    public ANestedLiteral $nestedLiteral;

    /**
     * @param ANestedLiteral $nestedLiteral
     */
    public function __construct(
        ANestedLiteral $nestedLiteral,
    ) {
        $this->nestedLiteral = $nestedLiteral;
    }
}
