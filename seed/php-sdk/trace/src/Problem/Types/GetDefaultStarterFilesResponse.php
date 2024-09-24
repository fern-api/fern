<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GetDefaultStarterFilesResponse extends SerializableType
{
    /**
     * @var array<value-of<Language>, ProblemFiles> $files
     */
    #[JsonProperty('files'), ArrayType(["string" => ProblemFiles::class])]
    public array $files;

    /**
     * @param array{
     *   files: array<value-of<Language>, ProblemFiles>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->files = $values['files'];
    }
}
