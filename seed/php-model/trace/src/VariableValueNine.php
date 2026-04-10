<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\DoublyLinkedListValue;
use Seed\Core\Json\JsonProperty;

class VariableValueNine extends JsonSerializableType
{
    use DoublyLinkedListValue;

    /**
     * @var value-of<VariableValueNineType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   nodes: array<string, DoublyLinkedListNodeValue>,
     *   type: value-of<VariableValueNineType>,
     *   head?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->head = $values['head'] ?? null;
        $this->nodes = $values['nodes'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
