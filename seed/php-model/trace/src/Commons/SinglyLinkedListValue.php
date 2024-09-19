<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class SinglyLinkedListValue extends SerializableType
{
    /**
     * @var array<string, SinglyLinkedListNodeValue> $nodes
     */
    #[JsonProperty("nodes"), ArrayType(["string" => SinglyLinkedListNodeValue::class])]
    public array $nodes;

    /**
     * @var ?string $head
     */
    #[JsonProperty("head")]
    public ?string $head;

    /**
     * @param array<string, SinglyLinkedListNodeValue> $nodes
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
