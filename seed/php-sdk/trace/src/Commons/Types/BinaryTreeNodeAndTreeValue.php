<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\BinaryTreeValue;

class BinaryTreeNodeAndTreeValue extends SerializableType
{
    #[JsonProperty("nodeId")]
    /**
     * @var string $nodeId
     */
    public string $nodeId;

    #[JsonProperty("fullTree")]
    /**
     * @var BinaryTreeValue $fullTree
     */
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
