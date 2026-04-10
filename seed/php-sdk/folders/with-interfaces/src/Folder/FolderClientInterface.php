<?php

namespace Seed\Folder;

use Seed\Folder\Service\ServiceClientInterface;

interface FolderClientInterface
{
    /**
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function foo(?array $options = null): void;

    /**
     * @return ServiceClientInterface
     */
    public function getService(): ServiceClientInterface;
}
