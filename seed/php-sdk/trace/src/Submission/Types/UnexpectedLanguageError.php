<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\JsonProperty;

class UnexpectedLanguageError extends SerializableType
{
    /**
     * @var Language $expectedLanguage
     */
    #[JsonProperty("expectedLanguage")]
    public Language $expectedLanguage;

    /**
     * @var Language $actualLanguage
     */
    #[JsonProperty("actualLanguage")]
    public Language $actualLanguage;

    /**
     * @param Language $expectedLanguage
     * @param Language $actualLanguage
     */
    public function __construct(
        Language $expectedLanguage,
        Language $actualLanguage,
    ) {
        $this->expectedLanguage = $expectedLanguage;
        $this->actualLanguage = $actualLanguage;
    }
}
