<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class WorkspaceStarterFilesResponseV2 extends JsonSerializableType
{
    /**
     * @var array<string, V2Files> $filesByLanguage
     */
    #[JsonProperty('filesByLanguage'), ArrayType(['string' => V2Files::class])]
    public array $filesByLanguage;

    /**
     * @param array{
     *   filesByLanguage: array<string, V2Files>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->filesByLanguage = $values['filesByLanguage'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
