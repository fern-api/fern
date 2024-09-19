<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class DeleteRequest
{
    /**
     * @var mixed $filter
     */
    #[JsonProperty("filter")]
    public mixed $filter;

    /**
     * @var ?array<string> $ids
     */
    #[JsonProperty("ids"), ArrayType(["string"])]
    public ?array $ids;

    /**
     * @var ?bool $deleteAll
     */
    #[JsonProperty("deleteAll")]
    public ?bool $deleteAll;

    /**
     * @var ?string $namespace
     */
    #[JsonProperty("namespace")]
    public ?string $namespace;

    /**
     * @param mixed $filter
     * @param ?array<string> $ids
     * @param ?bool $deleteAll
     * @param ?string $namespace
     */
    public function __construct(
        mixed $filter,
        ?array $ids = null,
        ?bool $deleteAll = null,
        ?string $namespace = null,
    ) {
        $this->filter = $filter;
        $this->ids = $ids;
        $this->deleteAll = $deleteAll;
        $this->namespace = $namespace;
    }
}
