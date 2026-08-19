<?php

namespace Seed\Derived\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Common\Traits\BaseType;
use Seed\Core\Json\JsonProperty;
use Seed\Common\Types\ChildType;

class DerivedType extends JsonSerializableType
{
    use BaseType;

    /**
     * @var string $derivedName
     */
    #[JsonProperty('derived_name')]
    public string $derivedName;

    /**
     * @param array{
     *   derivedName: string,
     *   childRef?: ?ChildType,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->childRef = $values['childRef'] ?? null;
        $this->derivedName = $values['derivedName'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
