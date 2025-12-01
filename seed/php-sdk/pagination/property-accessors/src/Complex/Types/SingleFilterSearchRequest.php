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
    private ?string $field;

    /**
     * @var ?value-of<SingleFilterSearchRequestOperator> $operator
     */
    #[JsonProperty('operator')]
    private ?string $operator;

    /**
     * @var ?string $value
     */
    #[JsonProperty('value')]
    private ?string $value;

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
     * @return ?string
     */
    public function getField(): ?string {
        return $this->field;}

    /**
     * @param ?string $value
     */
    public function setField(?string $value = null): self {
        $this->field = $value;return $this;}

    /**
     * @return ?value-of<SingleFilterSearchRequestOperator>
     */
    public function getOperator(): ?string {
        return $this->operator;}

    /**
     * @param ?value-of<SingleFilterSearchRequestOperator> $value
     */
    public function setOperator(?string $value = null): self {
        $this->operator = $value;return $this;}

    /**
     * @return ?string
     */
    public function getValue(): ?string {
        return $this->value;}

    /**
     * @param ?string $value
     */
    public function setValue(?string $value = null): self {
        $this->value = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
