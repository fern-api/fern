<?php

namespace Seed\Ast;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class NodesWrapper extends JsonSerializableType
{
    /**
     * @var array<array<(
     *    BranchNode
     *   |LeafNode
     * )>> $nodes
     */
    #[JsonProperty('nodes'), ArrayType([[new Union(BranchNode::class, LeafNode::class)]])]
    public array $nodes;

    /**
     * @param array{
     *   nodes: array<array<(
     *    BranchNode
     *   |LeafNode
     * )>>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->nodes = $values['nodes'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
