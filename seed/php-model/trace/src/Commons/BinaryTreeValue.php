<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class BinaryTreeValue extends SerializableType
{
    /**
     * @var ?string $root
     */
    #[JsonProperty("root")]
    public ?string $root;

    /**
     * @var array<string, BinaryTreeNodeValue> $nodes
     */
    #[JsonProperty("nodes"), ArrayType(["string" => BinaryTreeNodeValue::class])]
    public array $nodes;

    /**
     * @param array{
     *   root?: ?string,
     *   nodes: array<string, BinaryTreeNodeValue>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->root = $values['root'] ?? null;
        $this->nodes = $values['nodes'];
    }
}
