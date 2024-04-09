# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "fern_multi_url_environment/ec_2/client"
require_relative "fern_multi_url_environment/s_3/client"

module SeedMultiUrlEnvironmentClient
  class Client
    attr_reader :ec_2, :s_3

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedMultiUrlEnvironmentClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedMultiUrlEnvironmentClient::RequestClient.new(base_url: base_url, max_retries: max_retries,
                                                                         timeout_in_seconds: timeout_in_seconds, token: token)
      @ec_2 = SeedMultiUrlEnvironmentClient::Ec2Client.new(request_client: @request_client)
      @s_3 = SeedMultiUrlEnvironmentClient::S3Client.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :ec_2, :s_3

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedMultiUrlEnvironmentClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedMultiUrlEnvironmentClient::AsyncRequestClient.new(base_url: base_url,
                                                                                    max_retries: max_retries, timeout_in_seconds: timeout_in_seconds, token: token)
      @ec_2 = SeedMultiUrlEnvironmentClient::AsyncEc2Client.new(request_client: @async_request_client)
      @s_3 = SeedMultiUrlEnvironmentClient::AsyncS3Client.new(request_client: @async_request_client)
    end
  end
end
