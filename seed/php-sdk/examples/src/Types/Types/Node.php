<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Node extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var ?array<Node> $nodes
     */
    #[JsonProperty("nodes"), ArrayType([Node::class])]
    public ?array $nodes;

    /**
     * @var ?array<Tree> $trees
     */
    #[JsonProperty("trees"), ArrayType([Tree::class])]
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
