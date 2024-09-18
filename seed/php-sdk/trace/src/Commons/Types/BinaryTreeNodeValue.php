<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BinaryTreeNodeValue extends SerializableType
{
    /**
     * @var string $nodeId
     */
    #[JsonProperty("nodeId")]
    public string $nodeId;

    /**
     * @var float $val
     */
    #[JsonProperty("val")]
    public float $val;

    /**
     * @var ?string $right
     */
    #[JsonProperty("right")]
    public ?string $right;

    /**
     * @var ?string $left
     */
    #[JsonProperty("left")]
    public ?string $left;

    /**
     * @param string $nodeId
     * @param float $val
     * @param ?string $right
     * @param ?string $left
     */
    public function __construct(
        string $nodeId,
        float $val,
        ?string $right = null,
        ?string $left = null,
    ) {
        $this->nodeId = $nodeId;
        $this->val = $val;
        $this->right = $right;
        $this->left = $left;
    }
}
