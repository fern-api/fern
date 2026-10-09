<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PlantStrict extends JsonSerializableType
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
     * @param array{
     *   species: string,
     *   family: string,
     *   genus: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->species = $values['species'];
        $this->family = $values['family'];
        $this->genus = $values['genus'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
