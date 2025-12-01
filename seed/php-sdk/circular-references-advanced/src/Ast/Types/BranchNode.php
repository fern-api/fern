<?php

namespace Seed\Ast\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class BranchNode extends JsonSerializableType
{
    /**
     * @var array<(
     *    BranchNode
     *   |LeafNode
     * )> $children
     */
    #[JsonProperty('children'), ArrayType([new Union(BranchNode::class, LeafNode::class)])]
    public array $children;

    /**
     * @param array{
     *   children: array<(
     *    BranchNode
     *   |LeafNode
     * )>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->children = $values['children'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
