<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class AssetReportGetResponse extends JsonSerializableType
{
    /**
     * @var string $requestId
     */
    #[JsonProperty('request_id')]
    public string $requestId;

    /**
     * @param array{
     *   requestId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->requestId = $values['requestId'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
