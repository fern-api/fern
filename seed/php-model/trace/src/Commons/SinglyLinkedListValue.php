<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class SinglyLinkedListValue extends JsonSerializableType
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
     *   nodes: array<string, SinglyLinkedListNodeValue>,
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
