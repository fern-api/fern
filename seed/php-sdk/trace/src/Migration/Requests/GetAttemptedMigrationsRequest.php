<?php

namespace Seed\Migration\Requests;

class GetAttemptedMigrationsRequest
{
    /**
     * @var string $adminKeyHeader
     */
    public string $adminKeyHeader;

    /**
     * @param array{
     *   adminKeyHeader: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->adminKeyHeader = $values['adminKeyHeader'];
    }
}
