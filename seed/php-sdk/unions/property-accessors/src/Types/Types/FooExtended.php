<?php

namespace Seed\Types\Types;

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
    private int $age;

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
     * @return int
     */
    public function getAge(): int {
        return $this->age;}

    /**
     * @param int $value
     */
    public function setAge(int $value): self {
        $this->age = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
