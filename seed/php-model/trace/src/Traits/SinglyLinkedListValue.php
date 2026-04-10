<?php

namespace Seed\Traits;

use Seed\SinglyLinkedListNodeValue;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property ?string $head
 * @property array<string, SinglyLinkedListNodeValue> $nodes
 */
trait SinglyLinkedListValue
{
    /**
     * @var ?string $head
     */
    #[JsonProperty('head')]
    public ?string $head;

    /**
     * @var array<string, SinglyLinkedListNodeValue> $nodes
     */
    #[JsonProperty('nodes'), ArrayType(['string' => SinglyLinkedListNodeValue::class])]
    public array $nodes;
}
