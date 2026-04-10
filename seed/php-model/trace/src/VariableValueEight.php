<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\SinglyLinkedListValue;
use Seed\Core\Json\JsonProperty;

class VariableValueEight extends JsonSerializableType
{
    use SinglyLinkedListValue;

    /**
     * @var value-of<VariableValueEightType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   nodes: array<string, SinglyLinkedListNodeValue>,
     *   type: value-of<VariableValueEightType>,
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
