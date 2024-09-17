<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Language;

class GetFunctionSignatureResponse extends SerializableType
{
    #[JsonProperty("functionByLanguage"), ArrayType([Language::class => "string"])]
    /**
     * @var array<Language, string> $functionByLanguage
     */
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
