<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BinaryTreeNodeAndTreeValue extends JsonSerializableType
{
    /**
     * @var string $nodeId
     */
    #[JsonProperty('nodeId')]
    public string $nodeId;

    /**
     * @var BinaryTreeValue $fullTree
     */
    #[JsonProperty('fullTree')]
    public BinaryTreeValue $fullTree;

    /**
     * @param array{
     *   nodeId: string,
     *   fullTree: BinaryTreeValue,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->nodeId = $values['nodeId'];$this->fullTree = $values['fullTree'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
