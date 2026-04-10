<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TypesDog;
use Seed\Core\Json\JsonProperty;

class TypesAnimalZero extends JsonSerializableType
{
    use TypesDog;

    /**
     * @var value-of<TypesAnimalZeroAnimal> $animal
     */
    #[JsonProperty('animal')]
    public string $animal;

    /**
     * @param array{
     *   name: string,
     *   likesToWoof: bool,
     *   animal: value-of<TypesAnimalZeroAnimal>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->likesToWoof = $values['likesToWoof'];
        $this->animal = $values['animal'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
