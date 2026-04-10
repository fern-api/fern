<?php

namespace Seed\Traits;

use Seed\Language;
use Seed\Core\Json\JsonProperty;

/**
 * @property value-of<Language> $expectedLanguage
 * @property value-of<Language> $actualLanguage
 */
trait UnexpectedLanguageError
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
}
