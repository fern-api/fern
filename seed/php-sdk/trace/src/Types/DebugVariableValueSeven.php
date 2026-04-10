<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\BinaryTreeNodeAndTreeValue;
use Seed\Core\Json\JsonProperty;

class DebugVariableValueSeven extends JsonSerializableType
{
    use BinaryTreeNodeAndTreeValue;

    /**
     * @var value-of<DebugVariableValueSevenType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   nodeId: string,
     *   fullTree: BinaryTreeValue,
     *   type: value-of<DebugVariableValueSevenType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nodeId = $values['nodeId'];
        $this->fullTree = $values['fullTree'];
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
