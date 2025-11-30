<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class Dog extends JsonSerializableType
{
    /**
     * @var (
     *    Acai
     *   |Fig
     * ) $fruit
     */
    #[JsonProperty('fruit'), Union(Acai::class,Fig::class)]
    public Acai|Fig $fruit;

    /**
     * @param array{
     *   fruit: (
     *    Acai
     *   |Fig
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->fruit = $values['fruit'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
