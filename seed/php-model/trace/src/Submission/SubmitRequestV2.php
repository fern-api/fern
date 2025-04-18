<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Language;
use Seed\Core\Types\ArrayType;

class SubmitRequestV2 extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var value-of<Language> $language
     */
    #[JsonProperty('language')]
    public string $language;

    /**
     * @var array<SubmissionFileInfo> $submissionFiles
     */
    #[JsonProperty('submissionFiles'), ArrayType([SubmissionFileInfo::class])]
    public array $submissionFiles;

    /**
     * @var string $problemId
     */
    #[JsonProperty('problemId')]
    public string $problemId;

    /**
     * @var ?int $problemVersion
     */
    #[JsonProperty('problemVersion')]
    public ?int $problemVersion;

    /**
     * @var ?string $userId
     */
    #[JsonProperty('userId')]
    public ?string $userId;

    /**
     * @param array{
     *   submissionId: string,
     *   language: value-of<Language>,
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

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
