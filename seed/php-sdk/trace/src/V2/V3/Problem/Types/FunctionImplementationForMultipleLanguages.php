<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class FunctionImplementationForMultipleLanguages extends JsonSerializableType
{
    /**
     * @var array<value-of<Language>, FunctionImplementation> $codeByLanguage
     */
    #[JsonProperty('codeByLanguage'), ArrayType(['string' => FunctionImplementation::class])]
    public array $codeByLanguage;

    /**
     * @param array{
     *   codeByLanguage: array<value-of<Language>, FunctionImplementation>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->codeByLanguage = $values['codeByLanguage'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
