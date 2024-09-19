<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BinaryTreeNodeAndTreeValue extends SerializableType
{
    /**
     * @var string $nodeId
     */
    #[JsonProperty("nodeId")]
    public string $nodeId;

    /**
     * @var BinaryTreeValue $fullTree
     */
    #[JsonProperty("fullTree")]
    public BinaryTreeValue $fullTree;

    /**
     * @param string $nodeId
     * @param BinaryTreeValue $fullTree
     */
    public function __construct(
        string $nodeId,
        BinaryTreeValue $fullTree,
    ) {
        $this->nodeId = $nodeId;
        $this->fullTree = $fullTree;
    }
}
