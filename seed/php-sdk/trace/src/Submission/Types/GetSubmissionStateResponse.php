<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;
use Seed\Commons\Types\Language;

class GetSubmissionStateResponse extends JsonSerializableType
{
    /**
     * @var ?DateTime $timeSubmitted
     */
    #[JsonProperty('timeSubmitted'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $timeSubmitted;

    /**
     * @var string $submission
     */
    #[JsonProperty('submission')]
    public string $submission;

    /**
     * @var value-of<Language> $language
     */
    #[JsonProperty('language')]
    public string $language;

    /**
     * @var mixed $submissionTypeState
     */
    #[JsonProperty('submissionTypeState')]
    public mixed $submissionTypeState;

    /**
     * @param array{
     *   timeSubmitted?: ?DateTime,
     *   submission: string,
     *   language: value-of<Language>,
     *   submissionTypeState: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->timeSubmitted = $values['timeSubmitted'] ?? null;
        $this->submission = $values['submission'];
        $this->language = $values['language'];
        $this->submissionTypeState = $values['submissionTypeState'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
