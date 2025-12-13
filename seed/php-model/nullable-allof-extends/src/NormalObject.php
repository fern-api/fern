<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * A standard object with no nullable issues.
 */
class NormalObject extends JsonSerializableType
{
    /**
     * @var ?string $normalField
     */
    #[JsonProperty('normalField')]
    public ?string $normalField;

    /**
     * @param array{
     *   normalField?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->normalField = $values['normalField'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
