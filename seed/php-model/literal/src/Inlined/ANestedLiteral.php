<?php

namespace Seed\Inlined;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ANestedLiteral extends SerializableType
{
    /**
     * @var string $myLiteral
     */
    #[JsonProperty("myLiteral")]
    public string $myLiteral;

    /**
     * @param array{
     *   myLiteral: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->myLiteral = $values['myLiteral'];
    }
}
