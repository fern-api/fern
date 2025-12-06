<?php

namespace Seed\Commons;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DoublyLinkedListNodeValue extends JsonSerializableType
{
    /**
     * @var string $nodeId
     */
    #[JsonProperty('nodeId')]
    public string $nodeId;

    /**
     * @var float $val
     */
    #[JsonProperty('val')]
    public float $val;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;

    /**
     * @var ?string $prev
     */
    #[JsonProperty('prev')]
    public ?string $prev;

    /**
     * @param array{
     *   nodeId: string,
     *   val: float,
     *   next?: ?string,
     *   prev?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->nodeId = $values['nodeId'];$this->val = $values['val'];$this->next = $values['next'] ?? null;$this->prev = $values['prev'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
