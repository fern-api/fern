<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\SinglyLinkedListNodeAndListValue;
use Seed\Core\Json\JsonProperty;

class DebugVariableValueEight extends JsonSerializableType
{
    use SinglyLinkedListNodeAndListValue;

    /**
     * @var value-of<DebugVariableValueEightType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   nodeId: string,
     *   fullList: SinglyLinkedListValue,
     *   type: value-of<DebugVariableValueEightType>,
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
