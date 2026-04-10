<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Foo;
use Seed\Core\Json\JsonProperty;

class UnionWithBasePropertiesTwo extends JsonSerializableType
{
    use Foo;

    /**
     * @var value-of<UnionWithBasePropertiesTwoType> $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   name: string,
     *   type: value-of<UnionWithBasePropertiesTwoType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->type = $values['type'];
    }

    /**
     * @return value-of<UnionWithBasePropertiesTwoType>
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param value-of<UnionWithBasePropertiesTwoType> $value
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
