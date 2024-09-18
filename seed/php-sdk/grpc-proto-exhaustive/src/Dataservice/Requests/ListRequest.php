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

}
