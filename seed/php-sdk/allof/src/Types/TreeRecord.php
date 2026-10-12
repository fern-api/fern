<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TreeIdentifiable;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

class TreeRecord extends JsonSerializableType
{
    use TreeIdentifiable;

    /**
     * @var string $treeName Display name of the tree.
     */
    #[JsonProperty('treeName')]
    public string $treeName;

    /**
     * @var string $treeSpecies The species of tree.
     */
    #[JsonProperty('treeSpecies')]
    public string $treeSpecies;

    /**
     * @var ?DateTime $plantedDate Date the tree was planted.
     */
    #[JsonProperty('plantedDate'), Date(Date::TYPE_DATE)]
    public ?DateTime $plantedDate;

    /**
     * @var ?float $heightInFeet Height of the tree in feet.
     */
    #[JsonProperty('heightInFeet')]
    public ?float $heightInFeet;

    /**
     * @var ?string $treeDescription A description of the tree.
     */
    #[JsonProperty('treeDescription')]
    public ?string $treeDescription;

    /**
     * @param array{
     *   id: string,
     *   treeName: string,
     *   treeSpecies: string,
     *   plantedDate?: ?DateTime,
     *   heightInFeet?: ?float,
     *   treeDescription?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->treeName = $values['treeName'];
        $this->treeSpecies = $values['treeSpecies'];
        $this->plantedDate = $values['plantedDate'] ?? null;
        $this->heightInFeet = $values['heightInFeet'] ?? null;
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
