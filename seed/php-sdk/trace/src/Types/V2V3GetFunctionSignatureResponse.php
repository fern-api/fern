<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2V3GetFunctionSignatureResponse extends JsonSerializableType
{
    /**
     * @var array<string, string> $functionByLanguage
     */
    #[JsonProperty('functionByLanguage'), ArrayType(['string' => 'string'])]
    public array $functionByLanguage;

    /**
     * @param array{
     *   functionByLanguage: array<string, string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->functionByLanguage = $values['functionByLanguage'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
