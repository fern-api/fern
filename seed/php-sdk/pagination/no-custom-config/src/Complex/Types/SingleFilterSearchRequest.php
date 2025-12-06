<?php

namespace Seed\Complex\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SingleFilterSearchRequest extends JsonSerializableType
{
    /**
     * @var ?string $field
     */
    #[JsonProperty('field')]
    public ?string $field;

    /**
     * @var ?value-of<SingleFilterSearchRequestOperator> $operator
     */
    #[JsonProperty('operator')]
    public ?string $operator;

    /**
     * @var ?string $value
     */
    #[JsonProperty('value')]
    public ?string $value;

    /**
     * @param array{
     *   field?: ?string,
     *   operator?: ?value-of<SingleFilterSearchRequestOperator>,
     *   value?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->field = $values['field'] ?? null;$this->operator = $values['operator'] ?? null;$this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
