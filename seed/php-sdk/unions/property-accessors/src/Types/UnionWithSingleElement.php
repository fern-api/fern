<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Foo;
use Seed\Core\Json\JsonProperty;

class UnionWithSingleElement extends JsonSerializableType
{
    use Foo;

    /**
     * @var value-of<UnionWithSingleElementType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   name: string,
     *   type: value-of<UnionWithSingleElementType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<UnionWithSingleElementType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithSingleElementType> $value
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
