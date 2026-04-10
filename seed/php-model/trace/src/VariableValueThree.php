<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class VariableValueThree extends JsonSerializableType
{
    /**
     * @var value-of<VariableValueThreeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?string $value
     */
    #[JsonProperty('value')]
    public ?string $value;

    /**
     * @param array{
     *   type: value-of<VariableValueThreeType>,
     *   value?: ?string,
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
