<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetTokenRequest extends JsonSerializableType
{
    /**
     * @var string $apiKey
     */
    public string $apiKey;

    /**
     * @param array{
     *   apiKey: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->apiKey = $values['apiKey'];
    }
}
