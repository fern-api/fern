<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2FunctionImplementationForMultipleLanguages extends JsonSerializableType
{
    /**
     * @var array<string, V2FunctionImplementation> $codeByLanguage
     */
    #[JsonProperty('codeByLanguage'), ArrayType(['string' => V2FunctionImplementation::class])]
    public array $codeByLanguage;

    /**
     * @param array{
     *   codeByLanguage: array<string, V2FunctionImplementation>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->codeByLanguage = $values['codeByLanguage'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
