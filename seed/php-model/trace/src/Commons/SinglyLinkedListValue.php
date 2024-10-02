<?php

namespace Seed\Commons;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class SinglyLinkedListValue extends SerializableType
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

    /**
     * @param array{
     *   head?: ?string,
     *   nodes: array<string, SinglyLinkedListNodeValue>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->head = $values['head'] ?? null;
        $this->nodes = $values['nodes'];
    }
}
