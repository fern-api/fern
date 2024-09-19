<?php

namespace Seed\Dataservice\Requests;

class ListRequest
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
     * @param ?string $prefix
     * @param ?int $limit
     * @param ?string $paginationToken
     * @param ?string $namespace
     */
    public function __construct(
        ?string $prefix = null,
        ?int $limit = null,
        ?string $paginationToken = null,
        ?string $namespace = null,
    ) {
        $this->prefix = $prefix;
        $this->limit = $limit;
        $this->paginationToken = $paginationToken;
        $this->namespace = $namespace;
    }
}
