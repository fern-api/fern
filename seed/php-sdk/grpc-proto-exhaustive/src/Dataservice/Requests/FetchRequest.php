<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\Json\JsonSerializableType;

class FetchRequest extends JsonSerializableType
{
    /**
     * @var array<?string> $ids
     */
    public array $ids;

    /**
     * @var ?string $namespace
     */
    public ?string $namespace;

    /**
     * @param array{
     *   ids: array<?string>,
     *   namespace?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->ids = $values['ids'];
        $this->namespace = $values['namespace'] ?? null;
    }
}
