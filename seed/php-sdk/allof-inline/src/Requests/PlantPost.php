<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Types\PlantPostWateringFrequency;
use Seed\Types\PlantPostSunExposure;
use DateTime;
use Seed\Core\Types\Date;

class PlantPost extends JsonSerializableType
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
     * @var string $commonName The common name of the plant.
     */
    #[JsonProperty('commonName')]
    public string $commonName;

    /**
     * @var value-of<PlantPostWateringFrequency> $wateringFrequency
     */
    #[JsonProperty('wateringFrequency')]
    public string $wateringFrequency;

    /**
     * @var value-of<PlantPostSunExposure> $sunExposure Required sun exposure level.
     */
    #[JsonProperty('sunExposure')]
    public string $sunExposure;

    /**
     * @var ?DateTime $plantedAt Date the plant was planted.
     */
    #[JsonProperty('plantedAt'), Date(Date::TYPE_DATE)]
    public ?DateTime $plantedAt;

    /**
     * @var ?string $soilType Preferred soil type.
     */
    #[JsonProperty('soilType')]
    public ?string $soilType;

    /**
     * @param array{
     *   species: string,
     *   family: string,
     *   genus: string,
     *   commonName: string,
     *   wateringFrequency: value-of<PlantPostWateringFrequency>,
     *   sunExposure: value-of<PlantPostSunExposure>,
     *   plantedAt?: ?DateTime,
     *   soilType?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->species = $values['species'];
        $this->family = $values['family'];
        $this->genus = $values['genus'];
        $this->commonName = $values['commonName'];
        $this->wateringFrequency = $values['wateringFrequency'];
        $this->sunExposure = $values['sunExposure'];
        $this->plantedAt = $values['plantedAt'] ?? null;
        $this->soilType = $values['soilType'] ?? null;
    }
}
