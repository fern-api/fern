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
     * @param array{
     *   nodeId: string,
     *   val: float,
     *   right?: ?string,
     *   left?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nodeId = $values['nodeId'];
        $this->val = $values['val'];
        $this->right = $values['right'] ?? null;
        $this->left = $values['left'] ?? null;
    }
}
