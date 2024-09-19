<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\Language;
use DateTime;
use Seed\Core\DateType;

class GetSubmissionStateResponse extends SerializableType
{
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
     * @var ?DateTime $timeSubmitted
     */
    #[JsonProperty("timeSubmitted"), DateType(DateType::TYPE_DATETIME)]
    public ?DateTime $timeSubmitted;

    /**
     * @param string $submission
     * @param Language $language
     * @param mixed $submissionTypeState
     * @param ?DateTime $timeSubmitted
     */
    public function __construct(
        string $submission,
        Language $language,
        mixed $submissionTypeState,
        ?DateTime $timeSubmitted = null,
    ) {
        $this->submission = $submission;
        $this->language = $language;
        $this->submissionTypeState = $submissionTypeState;
        $this->timeSubmitted = $timeSubmitted;
    }
}
