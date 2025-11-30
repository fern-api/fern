<?php

namespace Seed\V2\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class GetBasicSolutionFileResponse extends JsonSerializableType
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
    )
    {
        $this->solutionFileByLanguage = $values['solutionFileByLanguage'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
