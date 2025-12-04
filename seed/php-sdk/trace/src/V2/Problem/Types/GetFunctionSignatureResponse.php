<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class GetFunctionSignatureResponse extends JsonSerializableType
{
    /**
     * @var array<value-of<Language>, string> $functionByLanguage
     */
    #[JsonProperty('functionByLanguage'), ArrayType(['string' => 'string'])]
    public array $functionByLanguage;

    /**
     * @param array{
     *   functionByLanguage: array<value-of<Language>, string>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->functionByLanguage = $values['functionByLanguage'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
