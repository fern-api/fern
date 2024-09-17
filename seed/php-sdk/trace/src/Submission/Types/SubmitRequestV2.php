<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\Language;
use Seed\Core\ArrayType;
use Seed\Submission\Types\SubmissionFileInfo;

class SubmitRequestV2 extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("language")]
    /**
     * @var Language $language
     */
    public Language $language;

    #[JsonProperty("submissionFiles"), ArrayType([SubmissionFileInfo])]
    /**
     * @var array<SubmissionFileInfo> $submissionFiles
     */
    public array $submissionFiles;

    #[JsonProperty("problemId")]
    /**
     * @var string $problemId
     */
    public string $problemId;

    #[JsonProperty("problemVersion")]
    /**
     * @var ?int $problemVersion
     */
    public ?int $problemVersion;

    #[JsonProperty("userId")]
    /**
     * @var ?string $userId
     */
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
