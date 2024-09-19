<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\Language;
use Seed\Core\ArrayType;

class WorkspaceSubmitRequest extends SerializableType
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
     * @var ?string $userId
     */
    #[JsonProperty("userId")]
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
