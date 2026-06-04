<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\PlantStrict;
use Seed\Core\Json\JsonProperty;

class PlantBase extends JsonSerializableType
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

    /**
     * @param array{
     *   species: string,
     *   family: string,
     *   genus: string,
     *   commonName?: ?string,
     *   wateringFrequency?: ?value-of<PlantBaseWateringFrequency>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->species = $values['species'];
        $this->family = $values['family'];
        $this->genus = $values['genus'];
        $this->commonName = $values['commonName'] ?? null;
        $this->wateringFrequency = $values['wateringFrequency'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
