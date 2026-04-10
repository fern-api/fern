<?php

namespace Seed\Traits;

use Seed\BinaryTreeNodeValue;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property ?string $root
 * @property array<string, BinaryTreeNodeValue> $nodes
 */
trait BinaryTreeValue
{
    /**
     * @var ?string $root
     */
    #[JsonProperty('root')]
    public ?string $root;

    /**
     * @var array<string, BinaryTreeNodeValue> $nodes
     */
    #[JsonProperty('nodes'), ArrayType(['string' => BinaryTreeNodeValue::class])]
    public array $nodes;
}
