<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SinglyLinkedListNodeAndListValue extends JsonSerializableType
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
