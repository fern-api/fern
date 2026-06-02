<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $species
 * @property string $family
 * @property string $genus
 */
trait PlantStrict
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
}
