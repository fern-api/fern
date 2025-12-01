<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Tree extends JsonSerializableType
{
    /**
     * @var ?array<Node> $nodes
     */
    #[JsonProperty('nodes'), ArrayType([Node::class])]
    public ?array $nodes;

    /**
     * @param array{
     *   nodes?: ?array<Node>,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->nodes = $values['nodes'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
