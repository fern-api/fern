<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Traits\Foo;
use Seed\Core\Json\JsonProperty;

class FooExtended extends JsonSerializableType
{
    use Foo;

    /**
     * @var int $age
     */
    #[JsonProperty('age')]
    public int $age;

    /**
     * @param array{
     *   name: string,
     *   age: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->age = $values['age'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
