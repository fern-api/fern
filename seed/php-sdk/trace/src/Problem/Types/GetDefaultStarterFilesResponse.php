<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Commons\Types\Language;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GetDefaultStarterFilesResponse extends SerializableType
{
    /**
     * @var array<Language, ProblemFiles> $files
     */
    #[JsonProperty('files'), ArrayType([Language::class => ProblemFiles::class])]
    public array $files;

    /**
     * @param array{
     *   files: array<Language, ProblemFiles>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->files = $values['files'];
    }
}
