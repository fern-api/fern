<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class GetDefaultStarterFilesResponse extends JsonSerializableType
{
    /**
     * @var array<string, ProblemFiles> $files
     */
    #[JsonProperty('files'), ArrayType(['string' => ProblemFiles::class])]
    public array $files;

    /**
     * @param array{
     *   files: array<string, ProblemFiles>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->files = $values['files'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
