<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property ?string $treeSpecies
 * @property ?float $heightInFeet
 */
trait TreeBase
{
    use TreeIdentifiable;
    use TreeDescribable;

    /**
     * @var ?string $treeSpecies The species of tree.
     */
    #[JsonProperty('treeSpecies')]
    public ?string $treeSpecies;

    /**
     * @var ?float $heightInFeet Height of the tree in feet.
     */
    #[JsonProperty('heightInFeet')]
    public ?float $heightInFeet;
}
