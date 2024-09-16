<?php

namespace Seed\V2\V3;

use Seed\Core\RawClient;
use Seed\V2\V3\Problem\ProblemClient;

class V3Client
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var ProblemClient $problem
     */
    public ProblemClient $problem;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
        $this->problem = new ProblemClient($this->client);
    }
}
