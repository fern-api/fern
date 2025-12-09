<?php

namespace Seed\Ast\Traits;

use Seed\Ast\Types\Cat;
use Seed\Ast\Types\Dog;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property (
 *    Cat
 *   |Dog
 * ) $animal
 */
trait Berry 
{
    /**
     * @var (
     *    Cat
     *   |Dog
     * ) $animal
     */
    #[JsonProperty('animal'), Union(Cat::class,Dog::class)]
    public Cat|Dog $animal;
}
