# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "fern_multi_url_environment_no_default/ec_2/client"
require_relative "fern_multi_url_environment_no_default/s_3/client"

module SeedMultiUrlEnvironmentNoDefaultClient
  class Client
    # @return [SeedMultiUrlEnvironmentNoDefaultClient::Ec2Client]
    attr_reader :ec_2
    # @return [SeedMultiUrlEnvironmentNoDefaultClient::S3Client]
    attr_reader :s_3

    # @param base_url [String]
    # @param environment [SeedMultiUrlEnvironmentNoDefaultClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedMultiUrlEnvironmentNoDefaultClient::Client]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedMultiUrlEnvironmentNoDefaultClient::RequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @ec_2 = SeedMultiUrlEnvironmentNoDefaultClient::Ec2Client.new(request_client: @request_client)
      @s_3 = SeedMultiUrlEnvironmentNoDefaultClient::S3Client.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedMultiUrlEnvironmentNoDefaultClient::AsyncEc2Client]
    attr_reader :ec_2
    # @return [SeedMultiUrlEnvironmentNoDefaultClient::AsyncS3Client]
    attr_reader :s_3

    # @param base_url [String]
    # @param environment [SeedMultiUrlEnvironmentNoDefaultClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [SeedMultiUrlEnvironmentNoDefaultClient::AsyncClient]
    def initialize(token:, base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedMultiUrlEnvironmentNoDefaultClient::AsyncRequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds,
        token: token
      )
      @ec_2 = SeedMultiUrlEnvironmentNoDefaultClient::AsyncEc2Client.new(request_client: @async_request_client)
      @s_3 = SeedMultiUrlEnvironmentNoDefaultClient::AsyncS3Client.new(request_client: @async_request_client)
    end
  end
end
