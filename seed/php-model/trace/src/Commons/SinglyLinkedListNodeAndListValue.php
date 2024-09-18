<?php

namespace Seed\Commons;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\SinglyLinkedListValue;

class SinglyLinkedListNodeAndListValue extends SerializableType
{
    #[JsonProperty("nodeId")]
    /**
     * @var string $nodeId
     */
    public string $nodeId;

    #[JsonProperty("fullList")]
    /**
     * @var SinglyLinkedListValue $fullList
     */
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
