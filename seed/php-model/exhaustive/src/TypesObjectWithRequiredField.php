<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TypesObjectWithRequiredField extends JsonSerializableType
{
    /**
     * @var string $string
     */
    #[JsonProperty('string')]
    public string $string;

    /**
     * @param array{
     *   string: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->string = $values['string'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
