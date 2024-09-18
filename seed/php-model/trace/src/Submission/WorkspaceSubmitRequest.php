<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Language;
use Seed\Core\ArrayType;
use Seed\Submission\SubmissionFileInfo;

class WorkspaceSubmitRequest extends SerializableType
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

    #[JsonProperty("submissionFiles"), ArrayType([SubmissionFileInfo::class])]
    /**
     * @var array<SubmissionFileInfo> $submissionFiles
     */
    public array $submissionFiles;

    #[JsonProperty("userId")]
    /**
     * @var ?string $userId
     */
    public ?string $userId;

    /**
     * @param string $submissionId
     * @param Language $language
     * @param array<SubmissionFileInfo> $submissionFiles
     * @param ?string $userId
     */
    public function __construct(
        string $submissionId,
        Language $language,
        array $submissionFiles,
        ?string $userId = null,
    ) {
        $this->submissionId = $submissionId;
        $this->language = $language;
        $this->submissionFiles = $submissionFiles;
        $this->userId = $userId;
    }
}
