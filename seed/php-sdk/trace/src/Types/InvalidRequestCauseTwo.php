<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\UnexpectedLanguageError;
use Seed\Core\Json\JsonProperty;

class InvalidRequestCauseTwo extends JsonSerializableType
{
    use UnexpectedLanguageError;

    /**
     * @var value-of<InvalidRequestCauseTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   expectedLanguage: value-of<Language>,
     *   actualLanguage: value-of<Language>,
     *   type: value-of<InvalidRequestCauseTwoType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->expectedLanguage = $values['expectedLanguage'];
        $this->actualLanguage = $values['actualLanguage'];
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
