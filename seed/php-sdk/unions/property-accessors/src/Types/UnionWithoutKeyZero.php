<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Foo;
use Seed\Core\Json\JsonProperty;

class UnionWithoutKeyZero extends JsonSerializableType
{
    use Foo;

    /**
     * @var value-of<UnionWithoutKeyZeroType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   name: string,
     *   type: value-of<UnionWithoutKeyZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<UnionWithoutKeyZeroType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithoutKeyZeroType> $value
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
