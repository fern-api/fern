<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class DoublyLinkedListValue extends SerializableType
{
    /**
     * @var ?string $head
     */
    #[JsonProperty("head")]
    public ?string $head;

    /**
     * @var array<string, DoublyLinkedListNodeValue> $nodes
     */
    #[JsonProperty("nodes"), ArrayType(["string" => DoublyLinkedListNodeValue::class])]
    public array $nodes;

    /**
     * @param array{
     *   head?: ?string,
     *   nodes: array<string, DoublyLinkedListNodeValue>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->head = $values['head'] ?? null;
        $this->nodes = $values['nodes'];
    }
}
