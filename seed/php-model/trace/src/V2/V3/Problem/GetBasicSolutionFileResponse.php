<?php

namespace Seed\V2\V3\Problem;

use Seed\Core\SerializableType;
use Seed\Commons\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GetBasicSolutionFileResponse extends SerializableType
{
    /**
     * @var array<Language, FileInfoV2> $solutionFileByLanguage
     */
    #[JsonProperty("solutionFileByLanguage"), ArrayType([Language::class => FileInfoV2::class])]
    public array $solutionFileByLanguage;

    /**
     * @param array<Language, FileInfoV2> $solutionFileByLanguage
     */
    public function __construct(
        array $solutionFileByLanguage,
    ) {
        $this->solutionFileByLanguage = $solutionFileByLanguage;
    }
}
