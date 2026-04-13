<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithLiteral extends JsonSerializableType
{
    /**
     * @var value-of<UnionWithLiteralType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?value-of<UnionWithLiteralValue> $value
     */
    #[JsonProperty('value')]
    public ?string $value;

    /**
     * @param array{
     *   type: value-of<UnionWithLiteralType>,
     *   value?: ?value-of<UnionWithLiteralValue>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
