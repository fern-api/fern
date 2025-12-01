<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BinaryTreeNodeValue extends JsonSerializableType
{
    /**
     * @var string $nodeId
     */
    #[JsonProperty('nodeId')]
    public string $nodeId;

    /**
     * @var float $val
     */
    #[JsonProperty('val')]
    public float $val;

    /**
     * @var ?string $right
     */
    #[JsonProperty('right')]
    public ?string $right;

    /**
     * @var ?string $left
     */
    #[JsonProperty('left')]
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
    )
    {
        $this->nodeId = $values['nodeId'];$this->val = $values['val'];$this->right = $values['right'] ?? null;$this->left = $values['left'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
