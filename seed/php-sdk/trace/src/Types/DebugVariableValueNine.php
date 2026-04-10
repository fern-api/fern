<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\DoublyLinkedListNodeAndListValue;
use Seed\Core\Json\JsonProperty;

class DebugVariableValueNine extends JsonSerializableType
{
    use DoublyLinkedListNodeAndListValue;

    /**
     * @var value-of<DebugVariableValueNineType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   nodeId: string,
     *   fullList: DoublyLinkedListValue,
     *   type: value-of<DebugVariableValueNineType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nodeId = $values['nodeId'];
        $this->fullList = $values['fullList'];
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
