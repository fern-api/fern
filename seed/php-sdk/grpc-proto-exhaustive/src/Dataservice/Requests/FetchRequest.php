<?php

namespace Seed\Dataservice\Requests;

class FetchRequest
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
     * @param array<?string> $ids
     * @param ?string $namespace
     */
    public function __construct(
        array $ids,
        ?string $namespace = null,
    ) {
        $this->ids = $ids;
        $this->namespace = $namespace;
    }
}
