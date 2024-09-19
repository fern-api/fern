<?php

namespace Seed\Inlined;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ATopLevelLiteral extends SerializableType
{
    /**
     * @var ANestedLiteral $nestedLiteral
     */
    #[JsonProperty("nestedLiteral")]
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
