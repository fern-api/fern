<?php

namespace Seed\Folder\Service;

interface ServiceClientInterface
{
    /**
     * Example:
     * ```php
     * $client->folder->service->endpoint();
     * ```
     *
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function endpoint(?array $options = null): void;

    /**
     * Example:
     * ```php
     * $client->folder->service->unknownRequest(
     *     [
     *         'key' => "value",
     *     ],
     * );
     * ```
     *
     * @param mixed $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function unknownRequest(mixed $request, ?array $options = null): void;
}
