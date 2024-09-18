<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class DoublyLinkedListNodeValue extends SerializableType
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

    #[JsonProperty("prev")]
    /**
     * @var ?string $prev
     */
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
