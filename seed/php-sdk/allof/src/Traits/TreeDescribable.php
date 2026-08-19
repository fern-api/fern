<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property ?string $treeName
 * @property ?string $treeDescription
 */
trait TreeDescribable
{
    /**
     * @var ?string $treeName Display name of the tree.
     */
    #[JsonProperty('treeName')]
    public ?string $treeName;

    /**
     * @var ?string $treeDescription A description of the tree.
     */
    #[JsonProperty('treeDescription')]
    public ?string $treeDescription;
}
