<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class DoublyLinkedListValue extends SerializableType
{
    /**
     * @var array<string, DoublyLinkedListNodeValue> $nodes
     */
    #[JsonProperty("nodes"), ArrayType(["string" => DoublyLinkedListNodeValue::class])]
    public array $nodes;

    /**
     * @var ?string $head
     */
    #[JsonProperty("head")]
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
