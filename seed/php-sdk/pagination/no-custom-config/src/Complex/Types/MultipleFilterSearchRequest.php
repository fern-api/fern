<?php

namespace Seed\Complex\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class MultipleFilterSearchRequest extends JsonSerializableType
{
    /**
     * @var ?value-of<MultipleFilterSearchRequestOperator> $operator
     */
    #[JsonProperty('operator')]
    public ?string $operator;

    /**
     * @var (
     *    array<MultipleFilterSearchRequest>
     *   |array<SingleFilterSearchRequest>
     * )|null $value
     */
    #[JsonProperty('value'), Union([MultipleFilterSearchRequest::class],[SingleFilterSearchRequest::class],'null')]
    public array|null $value;

    /**
     * @param array{
     *   operator?: ?value-of<MultipleFilterSearchRequestOperator>,
     *   value?: (
     *    array<MultipleFilterSearchRequest>
     *   |array<SingleFilterSearchRequest>
     * )|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->operator = $values['operator'] ?? null;$this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
