<?php

namespace Seed\Headers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SendLiteralsInHeadersRequest extends JsonSerializableType
{
    /**
     * @var '02-12-2024' $endpointVersion
     */
    public string $endpointVersion;

    /**
     * @var true $async
     */
    public bool $async;

    /**
     * @var string $query
     */
    #[JsonProperty('query')]
    public string $query;

    /**
     * @param array{
     *   endpointVersion: '02-12-2024',
     *   async: true,
     *   query: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->endpointVersion = $values['endpointVersion'];$this->async = $values['async'];$this->query = $values['query'];
    }
}
