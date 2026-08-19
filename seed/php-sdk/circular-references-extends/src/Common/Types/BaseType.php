<?php

namespace Seed\Common\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BaseType extends JsonSerializableType
{
    /**
     * @var ?ChildType $childRef
     */
    #[JsonProperty('child_ref')]
    public ?ChildType $childRef;

    /**
     * @param array{
     *   childRef?: ?ChildType,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->childRef = $values['childRef'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
