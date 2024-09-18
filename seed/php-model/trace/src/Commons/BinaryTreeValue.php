<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\BinaryTreeNodeValue;

class BinaryTreeValue extends SerializableType
{
    #[JsonProperty("nodes"), ArrayType(["string" => BinaryTreeNodeValue::class])]
    /**
     * @var array<string, BinaryTreeNodeValue> $nodes
     */
    public array $nodes;

    #[JsonProperty("root")]
    /**
     * @var ?string $root
     */
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
