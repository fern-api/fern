<?php

namespace Seed\Inlined\Types;

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
     * @param string $myLiteral
     */
    public function __construct(
        string $myLiteral,
    ) {
        $this->myLiteral = $myLiteral;
    }
}
