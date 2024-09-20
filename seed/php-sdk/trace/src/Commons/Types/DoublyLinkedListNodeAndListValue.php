<?php

namespace Seed\Commons\Types;

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
     * @param array{
     *   nodeId: string,
     *   fullList: DoublyLinkedListValue,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nodeId = $values['nodeId'];
        $this->fullList = $values['fullList'];
    }
}
