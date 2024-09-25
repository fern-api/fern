<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GetBasicSolutionFileResponse extends SerializableType
{
    /**
     * @var array<value-of<Language>, FileInfoV2> $solutionFileByLanguage
     */
    #[JsonProperty('solutionFileByLanguage'), ArrayType(['string' => FileInfoV2::class])]
    public array $solutionFileByLanguage;

    /**
     * @param array{
     *   solutionFileByLanguage: array<value-of<Language>, FileInfoV2>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->solutionFileByLanguage = $values['solutionFileByLanguage'];
    }
}
