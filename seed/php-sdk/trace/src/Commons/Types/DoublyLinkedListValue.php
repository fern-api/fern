<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Types\DoublyLinkedListNodeValue;

class DoublyLinkedListValue extends SerializableType
{
    #[JsonProperty("nodes"), ArrayType(["string" => DoublyLinkedListNodeValue])]
    /**
     * @var array<string, DoublyLinkedListNodeValue> $nodes
     */
    public array $nodes;

    #[JsonProperty("head")]
    /**
     * @var ?string $head
     */
    public ?string $head;

    /**
     * @param array<string, DoublyLinkedListNodeValue> $nodes
     * @param ?string $head
     */
    public function __construct(
        array $nodes,
        ?string $head = null,
    ) {
        $this->nodes = $nodes;
        $this->head = $head;
    }
}
