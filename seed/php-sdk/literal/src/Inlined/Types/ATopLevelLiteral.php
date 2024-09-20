<?php

namespace Seed\Inlined\Types;

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
