<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Types\Types\Node;
use Seed\Types\Types\Tree;

class Node extends SerializableType
{
    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("nodes"), ArrayType([Node::class])]
    /**
     * @var ?array<Node> $nodes
     */
    public ?array $nodes;

    #[JsonProperty("trees"), ArrayType([Tree::class])]
    /**
     * @var ?array<Tree> $trees
     */
    public ?array $trees;

    /**
     * @param string $name
     * @param ?array<Node> $nodes
     * @param ?array<Tree> $trees
     */
    public function __construct(
        string $name,
        ?array $nodes = null,
        ?array $trees = null,
    ) {
        $this->name = $name;
        $this->nodes = $nodes;
        $this->trees = $trees;
    }
}
