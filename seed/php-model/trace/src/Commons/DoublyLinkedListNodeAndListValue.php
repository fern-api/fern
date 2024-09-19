<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class DoublyLinkedListNodeAndListValue extends SerializableType
{
    /**
     * @var string $nodeId
     */
    #[JsonProperty("nodeId")]
    public string $nodeId;

    /**
     * @var DoublyLinkedListValue $fullList
     */
    #[JsonProperty("fullList")]
    public DoublyLinkedListValue $fullList;

    /**
     * @param string $nodeId
     * @param DoublyLinkedListValue $fullList
     */
    public function __construct(
        string $nodeId,
        DoublyLinkedListValue $fullList,
    ) {
        $this->nodeId = $nodeId;
        $this->fullList = $fullList;
    }
}
