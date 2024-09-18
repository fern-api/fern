<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Node;

class Tree extends SerializableType
{
    #[JsonProperty("nodes"), ArrayType([Node::class])]
    /**
     * @var ?array<Node> $nodes
     */
    public ?array $nodes;

    /**
     * @param ?array<Node> $nodes
     */
    public function __construct(
        ?array $nodes = null,
    ) {
        $this->nodes = $nodes;
    }
}
