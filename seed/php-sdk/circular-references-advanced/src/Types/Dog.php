<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class Dog extends JsonSerializableType
{
    /**
     * @var (
     *    Berry
     *   |Fig
     * ) $fruit
     */
    #[JsonProperty('fruit'), Union(Berry::class, Fig::class)]
    public Berry|Fig $fruit;

    /**
     * @param array{
     *   fruit: (
     *    Berry
     *   |Fig
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->fruit = $values['fruit'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
