<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SinglyLinkedListNodeAndListValue extends SerializableType
{
    /**
     * @var string $nodeId
     */
    #[JsonProperty("nodeId")]
    public string $nodeId;

    /**
     * @var SinglyLinkedListValue $fullList
     */
    #[JsonProperty("fullList")]
    public SinglyLinkedListValue $fullList;

    /**
     * @param string $nodeId
     * @param SinglyLinkedListValue $fullList
     */
    public function __construct(
        string $nodeId,
        SinglyLinkedListValue $fullList,
    ) {
        $this->nodeId = $nodeId;
        $this->fullList = $fullList;
    }
}
