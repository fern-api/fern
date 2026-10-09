<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TreeDescribable extends JsonSerializableType
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

    /**
     * @param array{
     *   treeName?: ?string,
     *   treeDescription?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->treeName = $values['treeName'] ?? null;
        $this->treeDescription = $values['treeDescription'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
