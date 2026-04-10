<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ANestedLiteral extends JsonSerializableType
{
    /**
     * @var value-of<ANestedLiteralMyLiteral> $myLiteral
     */
    #[JsonProperty('myLiteral')]
    public string $myLiteral;

    /**
     * @param array{
     *   myLiteral: value-of<ANestedLiteralMyLiteral>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->myLiteral = $values['myLiteral'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
