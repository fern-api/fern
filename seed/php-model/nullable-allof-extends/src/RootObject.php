<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\NormalObject;
use Seed\Traits\NullableObject;

/**
 * Object inheriting from a nullable schema via allOf.
 */
class RootObject extends JsonSerializableType
{
    use NormalObject;
    use NullableObject;


    /**
     * @param array{
     *   normalField?: ?string,
     *   nullableField?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->normalField = $values['normalField'] ?? null;
        $this->nullableField = $values['nullableField'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
