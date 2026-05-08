<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TypesCat;
use Seed\Core\Json\JsonProperty;

class TypesAnimalOne extends JsonSerializableType
{
    use TypesCat;

    /**
     * @var value-of<TypesAnimalOneAnimal> $animal
     */
    #[JsonProperty('animal')]
    public string $animal;

    /**
     * @param array{
     *   name: string,
     *   likesToMeow: bool,
     *   animal: value-of<TypesAnimalOneAnimal>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->likesToMeow = $values['likesToMeow'];
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
