<?php

namespace Seed\S3\Requests;

use Seed\Core\JsonProperty;

class GetPresignedUrlRequest
{
    /**
     * @var string $s3Key
     */
    #[JsonProperty("s3Key")]
    public string $s3Key;

    /**
     * @param string $s3Key
     */
    public function __construct(
        string $s3Key,
    ) {
        $this->s3Key = $s3Key;
    }
}
