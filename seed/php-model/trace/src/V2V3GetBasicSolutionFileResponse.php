<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2V3GetBasicSolutionFileResponse extends JsonSerializableType
{
    /**
     * @var array<string, V2V3FileInfoV2> $solutionFileByLanguage
     */
    #[JsonProperty('solutionFileByLanguage'), ArrayType(['string' => V2V3FileInfoV2::class])]
    public array $solutionFileByLanguage;

    /**
     * @param array{
     *   solutionFileByLanguage: array<string, V2V3FileInfoV2>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->solutionFileByLanguage = $values['solutionFileByLanguage'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
