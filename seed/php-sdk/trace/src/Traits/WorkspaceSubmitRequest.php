<?php

namespace Seed\Traits;

use Seed\Types\Language;
use Seed\Types\SubmissionFileInfo;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property string $submissionId
 * @property value-of<Language> $language
 * @property array<SubmissionFileInfo> $submissionFiles
 * @property ?string $userId
 */
trait WorkspaceSubmitRequest
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
     * @var ?string $userId
     */
    #[JsonProperty('userId')]
    public ?string $userId;
}
