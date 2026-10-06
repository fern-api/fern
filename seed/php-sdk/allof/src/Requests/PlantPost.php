<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\PlantStrict;
use Seed\Core\Json\JsonProperty;
use Seed\Types\PlantBaseWateringFrequency;
use Seed\Types\PlantPostSunExposure;
use DateTime;
use Seed\Core\Types\Date;

class PlantPost extends JsonSerializableType
{
    use PlantStrict;

    /**
     * @var string $commonName The common name of the plant.
     */
    #[JsonProperty('commonName')]
    public string $commonName;

    /**
     * @var value-of<PlantBaseWateringFrequency> $wateringFrequency
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
     *   commonName: string,
     *   wateringFrequency: value-of<PlantBaseWateringFrequency>,
     *   sunExposure: value-of<PlantPostSunExposure>,
     *   species: string,
     *   family: string,
     *   genus: string,
     *   plantedAt?: ?DateTime,
     *   soilType?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->commonName = $values['commonName'];
        $this->wateringFrequency = $values['wateringFrequency'];
        $this->sunExposure = $values['sunExposure'];
        $this->plantedAt = $values['plantedAt'] ?? null;
        $this->soilType = $values['soilType'] ?? null;
        $this->species = $values['species'];
        $this->family = $values['family'];
        $this->genus = $values['genus'];
    }
}
