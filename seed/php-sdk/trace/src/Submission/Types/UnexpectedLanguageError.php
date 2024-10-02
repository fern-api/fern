<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\SerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\Json\JsonProperty;

class UnexpectedLanguageError extends SerializableType
{
    /**
     * @var value-of<Language> $expectedLanguage
     */
    #[JsonProperty('expectedLanguage')]
    public string $expectedLanguage;

    /**
     * @var value-of<Language> $actualLanguage
     */
    #[JsonProperty('actualLanguage')]
    public string $actualLanguage;

    /**
     * @param array{
     *   expectedLanguage: value-of<Language>,
     *   actualLanguage: value-of<Language>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->expectedLanguage = $values['expectedLanguage'];
        $this->actualLanguage = $values['actualLanguage'];
    }
}
