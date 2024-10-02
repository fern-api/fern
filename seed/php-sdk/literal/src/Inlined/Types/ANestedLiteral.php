<?php

namespace Seed\Inlined\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class ANestedLiteral extends SerializableType
{
    /**
     * @var string $myLiteral
     */
    #[JsonProperty('myLiteral')]
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
