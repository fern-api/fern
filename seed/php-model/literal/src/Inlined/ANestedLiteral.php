<?php

namespace Seed\Inlined;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ANestedLiteral extends SerializableType
{
    #[JsonProperty("myLiteral")]
    /**
     * @var string $myLiteral
     */
    public string $myLiteral;

    /**
     * @param string $myLiteral
     */
    public function __construct(
        string $myLiteral,
    ) {
        $this->myLiteral = $myLiteral;
    }
}
