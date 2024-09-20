<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\Language;
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
     * @param array{
     *   submissionId: string,
     *   language: Language,
     *   submissionFiles: array<SubmissionFileInfo>,
     *   problemId: string,
     *   problemVersion?: ?int,
     *   userId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->language = $values['language'];
        $this->submissionFiles = $values['submissionFiles'];
        $this->problemId = $values['problemId'];
        $this->problemVersion = $values['problemVersion'] ?? null;
        $this->userId = $values['userId'] ?? null;
    }
}
