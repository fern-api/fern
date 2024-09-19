<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class DoublyLinkedListNodeValue extends SerializableType
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
     * @var ?string $prev
     */
    #[JsonProperty("prev")]
    public ?string $prev;

    /**
     * @param string $nodeId
     * @param float $val
     * @param ?string $next
     * @param ?string $prev
     */
    public function __construct(
        string $nodeId,
        float $val,
        ?string $next = null,
        ?string $prev = null,
    ) {
        $this->nodeId = $nodeId;
        $this->val = $val;
        $this->next = $next;
        $this->prev = $prev;
    }
}
