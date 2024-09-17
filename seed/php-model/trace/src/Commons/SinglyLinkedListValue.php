<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\SinglyLinkedListNodeValue;

class SinglyLinkedListValue extends SerializableType
{
    #[JsonProperty("nodes"), ArrayType(["string" => SinglyLinkedListNodeValue])]
    /**
     * @var array<string, SinglyLinkedListNodeValue> $nodes
     */
    public array $nodes;

    #[JsonProperty("head")]
    /**
     * @var ?string $head
     */
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
