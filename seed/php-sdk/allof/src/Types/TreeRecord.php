<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TreeBase;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

class TreeRecord extends JsonSerializableType
{
    use TreeBase;

    /**
     * @var ?DateTime $plantedDate Date the tree was planted.
     */
    #[JsonProperty('plantedDate'), Date(Date::TYPE_DATE)]
    public ?DateTime $plantedDate;

    /**
     * @param array{
     *   id: string,
     *   treeSpecies?: ?string,
     *   heightInFeet?: ?float,
     *   treeName?: ?string,
     *   treeDescription?: ?string,
     *   plantedDate?: ?DateTime,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->treeSpecies = $values['treeSpecies'] ?? null;
        $this->heightInFeet = $values['heightInFeet'] ?? null;
        $this->id = $values['id'];
        $this->treeName = $values['treeName'] ?? null;
        $this->treeDescription = $values['treeDescription'] ?? null;
        $this->plantedDate = $values['plantedDate'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
