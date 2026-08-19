<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TreeBase extends JsonSerializableType
{
    /**
     * @var string $id Unique tree identifier.
     */
    #[JsonProperty('id')]
    public string $id;

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
     * @var ?string $treeSpecies The species of tree.
     */
    #[JsonProperty('treeSpecies')]
    public ?string $treeSpecies;

    /**
     * @var ?float $heightInFeet Height of the tree in feet.
     */
    #[JsonProperty('heightInFeet')]
    public ?float $heightInFeet;

    /**
     * @param array{
     *   id: string,
     *   treeName?: ?string,
     *   treeDescription?: ?string,
     *   treeSpecies?: ?string,
     *   heightInFeet?: ?float,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->treeName = $values['treeName'] ?? null;
        $this->treeDescription = $values['treeDescription'] ?? null;
        $this->treeSpecies = $values['treeSpecies'] ?? null;
        $this->heightInFeet = $values['heightInFeet'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
