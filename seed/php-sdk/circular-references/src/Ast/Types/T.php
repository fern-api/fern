<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class T extends JsonSerializableType
{
    /**
     * @var (
     *    T
     *   |U
     * ) $child
     */
    #[JsonProperty('child'), Union(T::class,U::class)]
    public T|U $child;

    /**
     * @param array{
     *   child: (
     *    T
     *   |U
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->child = $values['child'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
