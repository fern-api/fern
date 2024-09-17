<?php

namespace Seed\Inlined;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Inlined\ANestedLiteral;

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
