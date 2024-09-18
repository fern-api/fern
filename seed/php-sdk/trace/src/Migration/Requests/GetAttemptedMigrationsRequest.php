<?php

namespace Seed\Migration\Requests;

class GetAttemptedMigrationsRequest
{
    /**
     * @var string $adminKeyHeader
     */
    public string $adminKeyHeader;

    /**
     * @param string $adminKeyHeader
     */
    public function __construct(
        string $adminKeyHeader,
    ) {
        $this->adminKeyHeader = $adminKeyHeader;
    }
}
