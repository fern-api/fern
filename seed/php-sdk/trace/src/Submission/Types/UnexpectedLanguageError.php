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
     * @param array{
     *   expectedLanguage: Language,
     *   actualLanguage: Language,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->expectedLanguage = $values['expectedLanguage'];
        $this->actualLanguage = $values['actualLanguage'];
    }
}
