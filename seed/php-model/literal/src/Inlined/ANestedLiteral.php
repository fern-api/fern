<?php

namespace Seed\Inlined;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ANestedLiteral extends JsonSerializableType
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

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
