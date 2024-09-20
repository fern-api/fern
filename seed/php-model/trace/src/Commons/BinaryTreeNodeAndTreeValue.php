<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BinaryTreeNodeAndTreeValue extends SerializableType
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
    ) {
        $this->nodeId = $values['nodeId'];
        $this->fullTree = $values['fullTree'];
    }
}
