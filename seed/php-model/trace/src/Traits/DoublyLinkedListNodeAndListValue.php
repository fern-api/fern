<?php

namespace Seed\Traits;

use Seed\DoublyLinkedListValue;
use Seed\Core\Json\JsonProperty;

/**
 * @property string $nodeId
 * @property DoublyLinkedListValue $fullList
 */
trait DoublyLinkedListNodeAndListValue
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
}
