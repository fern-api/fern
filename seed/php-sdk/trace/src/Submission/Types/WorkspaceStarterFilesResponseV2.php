<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\Types\Language;
use Seed\V2\Problem\Types\Files;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class WorkspaceStarterFilesResponseV2 extends JsonSerializableType
{
    /**
     * @var array<value-of<Language>, Files> $filesByLanguage
     */
    #[JsonProperty('filesByLanguage'), ArrayType(['string' => Files::class])]
    public array $filesByLanguage;

    /**
     * @param array{
     *   filesByLanguage: array<value-of<Language>, Files>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->filesByLanguage = $values['filesByLanguage'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
