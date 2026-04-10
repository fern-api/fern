<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Bar;
use Seed\Core\Json\JsonProperty;

class UnionWithoutKeyOne extends JsonSerializableType
{
    use Bar;

    /**
     * @var value-of<UnionWithoutKeyOneType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   name: string,
     *   type: value-of<UnionWithoutKeyOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<UnionWithoutKeyOneType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithoutKeyOneType> $value
     */
    public function setType(string $value): self
    {
        $this->type = $value;
        $this->_setField('type');
        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
