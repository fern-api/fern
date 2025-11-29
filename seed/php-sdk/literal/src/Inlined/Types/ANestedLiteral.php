<?php

namespace Seed\Inlined\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ANestedLiteral extends JsonSerializableType
{
    /**
     * @var 'How super cool' $myLiteral
     */
    #[JsonProperty('myLiteral')]
    public string $myLiteral;

    /**
     * @param array{
     *   myLiteral: 'How super cool',
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->myLiteral = $values['myLiteral'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
