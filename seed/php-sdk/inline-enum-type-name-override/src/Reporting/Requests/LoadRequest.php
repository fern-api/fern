<?php

namespace Seed\Reporting\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Reporting\Types\LoadRequestCache;
use Seed\Core\Json\JsonProperty;
use Seed\Reporting\Types\LoadRequestStatus;

class LoadRequest extends JsonSerializableType
{
    /**
     * @var ?value-of<LoadRequestCache> $cache
     */
    #[JsonProperty('cache')]
    public ?string $cache;

    /**
     * @var ?value-of<LoadRequestStatus> $status
     */
    #[JsonProperty('status')]
    public ?string $status;

    /**
     * @param array{
     *   cache?: ?value-of<LoadRequestCache>,
     *   status?: ?value-of<LoadRequestStatus>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->cache = $values['cache'] ?? null;
        $this->status = $values['status'] ?? null;
    }
}
