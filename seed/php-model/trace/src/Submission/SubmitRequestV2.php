<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Language;
use Seed\Core\ArrayType;

class SubmitRequestV2 extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var Language $language
     */
    #[JsonProperty("language")]
    public Language $language;

    /**
     * @var array<SubmissionFileInfo> $submissionFiles
     */
    #[JsonProperty("submissionFiles"), ArrayType([SubmissionFileInfo::class])]
    public array $submissionFiles;

    /**
     * @var string $problemId
     */
    #[JsonProperty("problemId")]
    public string $problemId;

    /**
     * @var ?int $problemVersion
     */
    #[JsonProperty("problemVersion")]
    public ?int $problemVersion;

    /**
     * @var ?string $userId
     */
    #[JsonProperty("userId")]
    public ?string $userId;

    /**
     * @param string $submissionId
     * @param Language $language
     * @param array<SubmissionFileInfo> $submissionFiles
     * @param string $problemId
     * @param ?int $problemVersion
     * @param ?string $userId
     */
    public function __construct(
        string $submissionId,
        Language $language,
        array $submissionFiles,
        string $problemId,
        ?int $problemVersion = null,
        ?string $userId = null,
    ) {
        $this->submissionId = $submissionId;
        $this->language = $language;
        $this->submissionFiles = $submissionFiles;
        $this->problemId = $problemId;
        $this->problemVersion = $problemVersion;
        $this->userId = $userId;
    }
}
