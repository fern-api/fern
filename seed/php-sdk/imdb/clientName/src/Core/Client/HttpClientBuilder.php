<?php

namespace Seed\Core\Client;

use Http\Discovery\Psr17FactoryDiscovery;
use Http\Discovery\Psr18ClientDiscovery;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;

class HttpClientBuilder
{
    /**
     * Builds an HTTP client wrapped with retry and timeout support.
     *
     * @param ?ClientInterface $client
     * @param int $maxRetries
     * @return RetryDecoratingClient
     */
    public static function build(?ClientInterface $client = null, int $maxRetries = 5): RetryDecoratingClient
    {
        $client = self::baseClient($client);
        return new RetryDecoratingClient($client, $maxRetries);
    }

    /**
     * Resolves a PSR-18 client, using discovery if none is provided.
     *
     * @param ?ClientInterface $client
     * @return ClientInterface
     */
    public static function baseClient(?ClientInterface $client = null): ClientInterface
    {
        return $client ?? Psr18ClientDiscovery::find();
    }

    /**
     * Discovers a PSR-17 request factory.
     *
     * @return RequestFactoryInterface
     */
    public static function requestFactory(): RequestFactoryInterface
    {
        return Psr17FactoryDiscovery::findRequestFactory();
    }

    /**
     * Discovers a PSR-17 stream factory.
     *
     * @return StreamFactoryInterface
     */
    public static function streamFactory(): StreamFactoryInterface
    {
        return Psr17FactoryDiscovery::findStreamFactory();
    }
}
