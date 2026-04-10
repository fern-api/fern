<?php

namespace Seed\Traits;

use Seed\SinglyLinkedListValue;
use Seed\Core\Json\JsonProperty;

/**
 * @property string $nodeId
 * @property SinglyLinkedListValue $fullList
 */
trait SinglyLinkedListNodeAndListValue
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
}
