<?php

namespace Seed\V2\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Language;
use Seed\V2\Problem\FunctionImplementation;

class FunctionImplementationForMultipleLanguages extends SerializableType
{
    #[JsonProperty("codeByLanguage"), ArrayType([Language::class => FunctionImplementation::class])]
    /**
     * @var array<Language, FunctionImplementation> $codeByLanguage
     */
    public array $codeByLanguage;

    /**
     * @param array<Language, FunctionImplementation> $codeByLanguage
     */
    public function __construct(
        array $codeByLanguage,
    ) {
        $this->codeByLanguage = $codeByLanguage;
    }
}
