<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Language;

class UnexpectedLanguageError extends SerializableType
{
    #[JsonProperty("expectedLanguage")]
    /**
     * @var Language $expectedLanguage
     */
    public Language $expectedLanguage;

    #[JsonProperty("actualLanguage")]
    /**
     * @var Language $actualLanguage
     */
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
