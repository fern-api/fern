# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require "faraday"
require "faraday/retry"
require_relative "seed_multi_url_environment_client/ec_2/client"
require_relative "seed_multi_url_environment_client/s_3/client"
require "async/http/faraday"

module SeedMultiUrlEnvironmentClient
  class Client
    attr_reader :ec_2, :s_3

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      @request_client = RequestClient.new(environment: environment, max_retries: max_retries,
                                          timeout_in_seconds: timeout_in_seconds, token: token)
      @ec_2 = Ec2Client.new(request_client: @request_client)
      @s_3 = S3Client.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :ec_2, :s_3

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      @async_request_client = AsyncRequestClient.new(environment: environment, max_retries: max_retries,
                                                     timeout_in_seconds: timeout_in_seconds, token: token)
      @ec_2 = AsyncEc2Client.new(request_client: @async_request_client)
      @s_3 = AsyncS3Client.new(request_client: @async_request_client)
    end
  end
end
