<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\Json\SerializableType;
use Seed\Commons\Language;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class GetFunctionSignatureResponse extends SerializableType
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
    ) {
        $this->functionByLanguage = $values['functionByLanguage'];
    }
}
