<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class BinaryTreeNodeValue extends SerializableType
{
    #[JsonProperty("nodeId")]
    /**
     * @var string $nodeId
     */
    public string $nodeId;

    #[JsonProperty("val")]
    /**
     * @var float $val
     */
    public float $val;

    #[JsonProperty("right")]
    /**
     * @var ?string $right
     */
    public ?string $right;

    #[JsonProperty("left")]
    /**
     * @var ?string $left
     */
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
