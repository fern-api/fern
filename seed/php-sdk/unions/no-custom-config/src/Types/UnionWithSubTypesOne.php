<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\FooExtended;
use Seed\Core\Json\JsonProperty;

class UnionWithSubTypesOne extends JsonSerializableType
{
    use FooExtended;

    /**
     * @var value-of<UnionWithSubTypesOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   age: int,
     *   name: string,
     *   type: value-of<UnionWithSubTypesOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->age = $values['age'];
        $this->name = $values['name'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
