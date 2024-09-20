<?php

namespace Seed\Commons\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class SinglyLinkedListNodeAndListValue extends SerializableType
{
    /**
     * @var string $nodeId
     */
    #[JsonProperty('nodeId')]
    public string $nodeId;

    /**
     * @var SinglyLinkedListValue $fullList
     */
    #[JsonProperty('fullList')]
    public SinglyLinkedListValue $fullList;

    /**
     * @param array{
     *   nodeId: string,
     *   fullList: SinglyLinkedListValue,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nodeId = $values['nodeId'];
        $this->fullList = $values['fullList'];
    }
}
