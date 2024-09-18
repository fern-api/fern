<?php

namespace Seed\Dataservice\Requests;

use Seed\Types\Column;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UploadRequest
{
    /**
     * @var array<Column> $columns
     */
    #[JsonProperty("columns"), ArrayType([Column::class])]
    public array $columns;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty("namespace")]
    public ?string $namespace;

}
