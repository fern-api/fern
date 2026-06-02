<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\PlantBase;
use Seed\Types\PlantPostSunExposure;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;
use Seed\Types\PlantBaseWateringFrequency;

class PlantPost extends JsonSerializableType
{
    use PlantBase;

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
     *   sunExposure: value-of<PlantPostSunExposure>,
     *   species: string,
     *   family: string,
     *   genus: string,
     *   plantedAt?: ?DateTime,
     *   soilType?: ?string,
     *   commonName?: ?string,
     *   wateringFrequency?: ?value-of<PlantBaseWateringFrequency>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->sunExposure = $values['sunExposure'];
        $this->plantedAt = $values['plantedAt'] ?? null;
        $this->soilType = $values['soilType'] ?? null;
        $this->commonName = $values['commonName'] ?? null;
        $this->wateringFrequency = $values['wateringFrequency'] ?? null;
        $this->species = $values['species'];
        $this->family = $values['family'];
        $this->genus = $values['genus'];
    }
}
