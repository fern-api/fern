<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property int $age
 */
trait FooExtended
{
    use Foo;

    /**
     * @var int $age
     */
    #[JsonProperty('age')]
    private int $age;

    /**
     * @return int
     */
    public function getAge(): int
    {
        return $this->age;
    }

    /**
     * @param int $value
     */
    public function setAge(int $value): self
    {
        $this->age = $value;
        $this->_setField('age');
        return $this;
    }
}
