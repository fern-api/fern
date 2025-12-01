<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetResourceRequest extends JsonSerializableType
{
    /**
     * @var bool $includeMetadata Include metadata in response
     */
    public bool $includeMetadata;

    /**
     * @var string $format Response format
     */
    public string $format;

    /**
     * @param array{
     *   includeMetadata: bool,
     *   format: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->includeMetadata = $values['includeMetadata'];$this->format = $values['format'];
    }
}
