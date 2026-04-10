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
    public int $age;
}
