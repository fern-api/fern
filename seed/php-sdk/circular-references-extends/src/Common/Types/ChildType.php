<?php

namespace Seed\Common\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Common\Traits\BaseType;
use Seed\Core\Json\JsonProperty;

class ChildType extends JsonSerializableType
{
    use BaseType;

    /**
     * @var string $childName
     */
    #[JsonProperty('child_name')]
    public string $childName;

    /**
     * @param array{
     *   childName: string,
     *   childRef?: ?ChildType,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->childRef = $values['childRef'] ?? null;
        $this->childName = $values['childName'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
