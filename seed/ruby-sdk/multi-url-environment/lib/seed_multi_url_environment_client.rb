# frozen_string_literal: true

require "faraday"
require_relative "seed_multi_url_environment_client/ec_2/client"
require_relative "seed_multi_url_environment_client/s_3/client"
require "async/http/faraday"

module SeedMultiUrlEnvironmentClient
  class Client
    attr_reader :ec_2_client, :s_3_client

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.new(environment: environment, max_retries: max_retries,
                                         timeout_in_seconds: timeout_in_seconds, token: token)
      @ec_2_client = Ec2::Ec2Client.new(request_client: request_client)
      @s_3_client = S3::S3Client.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_ec_2_client, :async_s_3_client

    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(environment: Environment::PRODUCTION, max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_ec_2_client = Ec2::AsyncEc2Client.new(request_client: request_client)
      @async_s_3_client = S3::AsyncS3Client.new(request_client: request_client)
    end
  end
end
