<?php

namespace Seed\Traits;

use Seed\BinaryTreeValue;
use Seed\Core\Json\JsonProperty;

/**
 * @property string $nodeId
 * @property BinaryTreeValue $fullTree
 */
trait BinaryTreeNodeAndTreeValue
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
}
