<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CreatePlantWithSchemaRequest extends JsonSerializableType
{
    /**
     * @var ?string $name
     */
    #[JsonProperty('name')]
    public ?string $name;

    /**
     * @var ?string $species
     */
    #[JsonProperty('species')]
    public ?string $species;

    /**
     * @param array{
     *   name?: ?string,
     *   species?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->name = $values['name'] ?? null;
        $this->species = $values['species'] ?? null;
    }
}
