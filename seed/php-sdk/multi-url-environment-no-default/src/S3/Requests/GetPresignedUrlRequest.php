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

}
