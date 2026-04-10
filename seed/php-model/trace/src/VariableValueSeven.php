<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\BinaryTreeValue;
use Seed\Core\Json\JsonProperty;

class VariableValueSeven extends JsonSerializableType
{
    use BinaryTreeValue;

    /**
     * @var value-of<VariableValueSevenType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   nodes: array<string, BinaryTreeNodeValue>,
     *   type: value-of<VariableValueSevenType>,
     *   root?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->root = $values['root'] ?? null;
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
