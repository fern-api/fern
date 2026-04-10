<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2GetBasicSolutionFileResponse extends JsonSerializableType
{
    /**
     * @var array<string, V2FileInfoV2> $solutionFileByLanguage
     */
    #[JsonProperty('solutionFileByLanguage'), ArrayType(['string' => V2FileInfoV2::class])]
    public array $solutionFileByLanguage;

    /**
     * @param array{
     *   solutionFileByLanguage: array<string, V2FileInfoV2>,
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
