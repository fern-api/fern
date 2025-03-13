<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class SecondUnionFirstElement extends JsonSerializableType
{
    /**
     * @var (
     *    FirstUnionFirstElement
     *   |FirstUnionSecondElement
     * ) $child
     */
    #[JsonProperty('child'), Union(FirstUnionFirstElement::class, FirstUnionSecondElement::class)]
    public FirstUnionFirstElement|FirstUnionSecondElement $child;

    /**
     * @param array{
     *   child: (
     *    FirstUnionFirstElement
     *   |FirstUnionSecondElement
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
