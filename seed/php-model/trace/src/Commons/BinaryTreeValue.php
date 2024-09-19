<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class BinaryTreeValue extends SerializableType
{
    /**
     * @var array<string, BinaryTreeNodeValue> $nodes
     */
    #[JsonProperty("nodes"), ArrayType(["string" => BinaryTreeNodeValue::class])]
    public array $nodes;

    /**
     * @var ?string $root
     */
    #[JsonProperty("root")]
    public ?string $root;

    /**
     * @param array<string, BinaryTreeNodeValue> $nodes
     * @param ?string $root
     */
    public function __construct(
        array $nodes,
        ?string $root = null,
    ) {
        $this->nodes = $nodes;
        $this->root = $root;
    }
}
