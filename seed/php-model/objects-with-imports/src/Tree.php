<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class Tree extends SerializableType
{
    /**
     * @var ?array<Node> $nodes
     */
    #[JsonProperty("nodes"), ArrayType([Node::class])]
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
