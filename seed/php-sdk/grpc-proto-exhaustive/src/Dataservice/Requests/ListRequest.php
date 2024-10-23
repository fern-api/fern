<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListRequest extends JsonSerializableType
{
    /**
     * @var ?string $prefix
     */
    public ?string $prefix;

    /**
     * @var ?int $limit
     */
    public ?int $limit;

    /**
     * @var ?string $paginationToken
     */
    public ?string $paginationToken;

    /**
     * @var ?string $namespace
     */
    public ?string $namespace;

    /**
     * @param array{
     *   prefix?: ?string,
     *   limit?: ?int,
     *   paginationToken?: ?string,
     *   namespace?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->prefix = $values['prefix'] ?? null;
        $this->limit = $values['limit'] ?? null;
        $this->paginationToken = $values['paginationToken'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
    }
}
