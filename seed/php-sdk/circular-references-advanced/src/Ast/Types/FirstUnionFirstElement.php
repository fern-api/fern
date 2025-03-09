<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class FirstUnionFirstElement extends JsonSerializableType
{
    /**
     * @var (
     *    SecondUnionFirstElement
     *   |SecondUnionSecondElement
     * ) $child
     */
    #[JsonProperty('child'), Union(SecondUnionFirstElement::class, SecondUnionSecondElement::class)]
    public SecondUnionFirstElement|SecondUnionSecondElement $child;

    /**
     * @param array{
     *   child: (
     *    SecondUnionFirstElement
     *   |SecondUnionSecondElement
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->child = $values['child'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
