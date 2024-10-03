<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Column;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UploadRequest extends JsonSerializableType
{
    /**
     * @var array<Column> $columns
     */
    #[JsonProperty('columns'), ArrayType([Column::class])]
    public array $columns;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty('namespace')]
    public ?string $namespace;

    /**
     * @param array{
     *   columns: array<Column>,
     *   namespace?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->columns = $values['columns'];
        $this->namespace = $values['namespace'] ?? null;
    }
}
