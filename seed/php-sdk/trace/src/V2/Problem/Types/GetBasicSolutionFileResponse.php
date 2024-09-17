<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Commons\Types\Language;
use Seed\V2\Problem\Types\FileInfoV2;

class GetBasicSolutionFileResponse extends SerializableType
{
    #[JsonProperty("solutionFileByLanguage"), ArrayType([Language => FileInfoV2])]
    /**
     * @var array<Language, FileInfoV2> $solutionFileByLanguage
     */
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
