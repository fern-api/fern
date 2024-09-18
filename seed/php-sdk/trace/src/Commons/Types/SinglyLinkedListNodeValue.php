<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SinglyLinkedListNodeValue extends SerializableType
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

    #[JsonProperty("next")]
    /**
     * @var ?string $next
     */
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
