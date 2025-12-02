<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Node extends JsonSerializableType
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
    )
    {
        $this->name = $values['name'];$this->nodes = $values['nodes'] ?? null;$this->trees = $values['trees'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
