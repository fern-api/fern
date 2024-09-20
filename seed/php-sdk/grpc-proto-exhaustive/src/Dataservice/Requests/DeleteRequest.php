<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class DeleteRequest
{
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
     * @var mixed $filter
     */
    #[JsonProperty("filter")]
    public mixed $filter;

    /**
     * @param array{
     *   ids?: ?array<string>,
     *   deleteAll?: ?bool,
     *   namespace?: ?string,
     *   filter: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->ids = $values['ids'] ?? null;
        $this->deleteAll = $values['deleteAll'] ?? null;
        $this->namespace = $values['namespace'] ?? null;
        $this->filter = $values['filter'];
    }
}
