<?php

namespace Seed\Ast;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class Fig extends JsonSerializableType
{
    /**
     * @var (
     *    Cat
     *   |Dog
     * ) $animal
     */
    #[JsonProperty('animal'), Union(Cat::class,Dog::class)]
    public Cat|Dog $animal;

    /**
     * @param array{
     *   animal: (
     *    Cat
     *   |Dog
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->animal = $values['animal'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
