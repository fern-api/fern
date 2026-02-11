<?php

namespace Seed\Endpoints\Params;

use Seed\Endpoints\Params\Requests\GetWithQuery;
use Seed\Endpoints\Params\Requests\GetWithMultipleQuery;
use Seed\Endpoints\Params\Requests\GetWithPathAndQuery;
use Seed\Endpoints\Params\Requests\GetWithInlinePathAndQuery;
use Seed\Endpoints\Params\Requests\ModifyResourceAtInlinedPath;

interface ParamsClientInterface
{
    /**
     * GET with path param
     *
     * @param string $param
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return string
     */
    public function getWithPath(string $param, ?array $options = null): string;

    /**
     * GET with path param
     *
     * @param string $param
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return string
     */
    public function getWithInlinePath(string $param, ?array $options = null): string;

    /**
     * GET with query param
     *
     * @param GetWithQuery $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function getWithQuery(GetWithQuery $request, ?array $options = null): void;

    /**
     * GET with multiple of same query param
     *
     * @param GetWithMultipleQuery $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function getWithAllowMultipleQuery(GetWithMultipleQuery $request, ?array $options = null): void;

    /**
     * GET with path and query params
     *
     * @param string $param
     * @param GetWithPathAndQuery $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function getWithPathAndQuery(string $param, GetWithPathAndQuery $request, ?array $options = null): void;

    /**
     * GET with path and query params
     *
     * @param string $param
     * @param GetWithInlinePathAndQuery $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     */
    public function getWithInlinePathAndQuery(string $param, GetWithInlinePathAndQuery $request, ?array $options = null): void;

    /**
     * PUT to update with path param
     *
     * @param string $param
     * @param string $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return string
     */
    public function modifyWithPath(string $param, string $request, ?array $options = null): string;

    /**
     * PUT to update with path param
     *
     * @param string $param
     * @param ModifyResourceAtInlinedPath $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return string
     */
    public function modifyWithInlinePath(string $param, ModifyResourceAtInlinedPath $request, ?array $options = null): string;
}
