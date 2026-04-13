<?php

namespace Seed;

use Seed\Ab\AbClientInterface;
use Seed\Ac\AcClientInterface;
use Seed\Folder\FolderClientInterface;
use Seed\FolderService\FolderServiceClientInterface;

interface SeedClientInterface
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
     * @return AbClientInterface
     */
    public function getAb(): AbClientInterface;

    /**
     * @return AcClientInterface
     */
    public function getAc(): AcClientInterface;

    /**
     * @return FolderClientInterface
     */
    public function getFolder(): FolderClientInterface;

    /**
     * @return FolderServiceClientInterface
     */
    public function getFolderService(): FolderServiceClientInterface;
}
