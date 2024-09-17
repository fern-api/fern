<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\DoublyLinkedListValue;

class DoublyLinkedListNodeAndListValue extends SerializableType
{
    #[JsonProperty("nodeId")]
    /**
     * @var string $nodeId
     */
    public string $nodeId;

    #[JsonProperty("fullList")]
    /**
     * @var DoublyLinkedListValue $fullList
     */
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
