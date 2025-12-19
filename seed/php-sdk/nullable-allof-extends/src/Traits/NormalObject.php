<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * A standard object with no nullable issues.
 *
 * @property ?string $normalField
 */
trait NormalObject
{
    /**
     * @var ?string $normalField
     */
    #[JsonProperty('normalField')]
    public ?string $normalField;
}
