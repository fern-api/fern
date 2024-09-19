<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use DateTime;
use Seed\Core\JsonProperty;
use Seed\Core\DateType;
use Seed\Commons\Types\Language;

class GetSubmissionStateResponse extends SerializableType
{
    /**
     * @var ?DateTime $timeSubmitted
     */
    #[JsonProperty("timeSubmitted"), DateType(DateType::TYPE_DATETIME)]
    public ?DateTime $timeSubmitted;

    /**
     * @var string $submission
     */
    #[JsonProperty("submission")]
    public string $submission;

    /**
     * @var Language $language
     */
    #[JsonProperty("language")]
    public Language $language;

    /**
     * @var mixed $submissionTypeState
     */
    #[JsonProperty("submissionTypeState")]
    public mixed $submissionTypeState;

    /**
     * @param array{
     *   timeSubmitted?: ?DateTime,
     *   submission: string,
     *   language: Language,
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
}
