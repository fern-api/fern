<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SinglyLinkedListNodeValue extends SerializableType
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
     * @var ?string $next
     */
    #[JsonProperty("next")]
    public ?string $next;

    /**
     * @param string $nodeId
     * @param float $val
     * @param ?string $next
     */
    public function __construct(
        string $nodeId,
        float $val,
        ?string $next = null,
    ) {
        $this->nodeId = $nodeId;
        $this->val = $val;
        $this->next = $next;
    }
}
