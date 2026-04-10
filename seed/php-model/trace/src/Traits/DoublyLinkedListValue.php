<?php

namespace Seed\Traits;

use Seed\DoublyLinkedListNodeValue;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property ?string $head
 * @property array<string, DoublyLinkedListNodeValue> $nodes
 */
trait DoublyLinkedListValue
{
    /**
     * @var ?string $head
     */
    #[JsonProperty('head')]
    public ?string $head;

    /**
     * @var array<string, DoublyLinkedListNodeValue> $nodes
     */
    #[JsonProperty('nodes'), ArrayType(['string' => DoublyLinkedListNodeValue::class])]
    public array $nodes;
}
