<?php

namespace Seed\Commons\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DoublyLinkedListNodeAndListValue extends JsonSerializableType
{
    /**
     * @var string $nodeId
     */
    #[JsonProperty('nodeId')]
    public string $nodeId;

    /**
     * @var DoublyLinkedListValue $fullList
     */
    #[JsonProperty('fullList')]
    public DoublyLinkedListValue $fullList;

    /**
     * @param array{
     *   nodeId: string,
     *   fullList: DoublyLinkedListValue,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->nodeId = $values['nodeId'];$this->fullList = $values['fullList'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
