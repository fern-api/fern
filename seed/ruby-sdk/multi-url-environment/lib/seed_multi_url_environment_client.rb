# frozen_string_literal: true

require "faraday"
require_relative "seed_multi_url_environment_client/ec_2/client"
require_relative "seed_multi_url_environment_client/s_3/client"
require "async/http/faraday"

module SeedMultiUrlEnvironmentClient
  class Client
    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @ec_2_client = Ec2Client.initialize(request_client: request_client)
      @s_3_client = S3Client.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_ec_2_client = AsyncEc2Client.initialize(request_client: request_client)
      @async_s_3_client = AsyncS3Client.initialize(request_client: request_client)
    end
  end
end
