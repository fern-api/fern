<?php

namespace Seed\Traits;

use Seed\Types\PlantBaseWateringFrequency;
use Seed\Core\Json\JsonProperty;

/**
 * @property ?string $commonName
 * @property ?value-of<PlantBaseWateringFrequency> $wateringFrequency
 */
trait PlantBase
{
    use PlantStrict;

    /**
     * @var ?string $commonName The common name of the plant.
     */
    #[JsonProperty('commonName')]
    public ?string $commonName;

    /**
     * @var ?value-of<PlantBaseWateringFrequency> $wateringFrequency
     */
    #[JsonProperty('wateringFrequency')]
    public ?string $wateringFrequency;
}
