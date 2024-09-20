<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Node extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?array<Node> $nodes
     */
    #[JsonProperty('nodes'), ArrayType([Node::class])]
    public ?array $nodes;

    /**
     * @var ?array<Tree> $trees
     */
    #[JsonProperty('trees'), ArrayType([Tree::class])]
    public ?array $trees;

    /**
     * @param array{
     *   name: string,
     *   nodes?: ?array<Node>,
     *   trees?: ?array<Tree>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->nodes = $values['nodes'] ?? null;
        $this->trees = $values['trees'] ?? null;
    }
}
