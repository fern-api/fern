<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PlantBase extends JsonSerializableType
{
    /**
     * @var string $species The botanical species name.
     */
    #[JsonProperty('species')]
    public string $species;

    /**
     * @var string $family The botanical family.
     */
    #[JsonProperty('family')]
    public string $family;

    /**
     * @var string $genus The botanical genus.
     */
    #[JsonProperty('genus')]
    public string $genus;

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
