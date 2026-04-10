<?php

namespace Seed\S3\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GetPresignedUrlRequest extends JsonSerializableType
{
    /**
     * @var string $s3Key
     */
    #[JsonProperty('s3Key')]
    public string $s3Key;

    /**
     * @param array{
     *   s3Key: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->s3Key = $values['s3Key'];
    }
}
