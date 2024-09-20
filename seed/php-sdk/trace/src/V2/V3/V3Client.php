<?php

namespace Seed\V2\V3;

use Seed\V2\V3\Problem\ProblemClient;
use Seed\Core\RawClient;

class V3Client
{
    /**
     * @var ProblemClient $problem
     */
    public ProblemClient $problem;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

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
