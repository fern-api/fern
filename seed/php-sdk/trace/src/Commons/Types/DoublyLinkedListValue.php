<?php

namespace Seed\Commons\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class DoublyLinkedListValue extends JsonSerializableType
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

    /**
     * @param array{
     *   nodes: array<string, DoublyLinkedListNodeValue>,
     *   head?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->head = $values['head'] ?? null;$this->nodes = $values['nodes'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
