<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Commons\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GetFunctionSignatureResponse extends SerializableType
{
    /**
     * @var array<Language, string> $functionByLanguage
     */
    #[JsonProperty("functionByLanguage"), ArrayType([Language::class => "string"])]
    public array $functionByLanguage;

    /**
     * @param array<Language, string> $functionByLanguage
     */
    public function __construct(
        array $functionByLanguage,
    ) {
        $this->functionByLanguage = $functionByLanguage;
    }
}
