# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "fern_trace/v_2/client"
require_relative "fern_trace/admin/client"
require_relative "fern_trace/homepage/client"
require_relative "fern_trace/migration/client"
require_relative "fern_trace/playlist/client"
require_relative "fern_trace/problem/client"
require_relative "fern_trace/submission/client"
require_relative "fern_trace/sysprop/client"

module SeedTraceClient
  class Client
    attr_reader :v_2, :admin, :homepage, :migration, :playlist, :problem, :submission, :sysprop

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @param x_random_header [String]
    # @return [SeedTraceClient::Client]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil, x_random_header: nil)
      @request_client = SeedTraceClient::RequestClient.new(base_url: base_url, max_retries: max_retries,
                                                           timeout_in_seconds: timeout_in_seconds, token: token, x_random_header: x_random_header)
      @v_2 = SeedTraceClient::V2::V2Client.new(request_client: @request_client)
      @admin = SeedTraceClient::AdminClient.new(request_client: @request_client)
      @homepage = SeedTraceClient::HomepageClient.new(request_client: @request_client)
      @migration = SeedTraceClient::MigrationClient.new(request_client: @request_client)
      @playlist = SeedTraceClient::PlaylistClient.new(request_client: @request_client)
      @problem = SeedTraceClient::ProblemClient.new(request_client: @request_client)
      @submission = SeedTraceClient::SubmissionClient.new(request_client: @request_client)
      @sysprop = SeedTraceClient::SyspropClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :v_2, :admin, :homepage, :migration, :playlist, :problem, :submission, :sysprop

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @param x_random_header [String]
    # @return [SeedTraceClient::AsyncClient]
    def initialize(token:, base_url: nil, max_retries: nil, timeout_in_seconds: nil, x_random_header: nil)
      @async_request_client = SeedTraceClient::AsyncRequestClient.new(base_url: base_url, max_retries: max_retries,
                                                                      timeout_in_seconds: timeout_in_seconds, token: token, x_random_header: x_random_header)
      @v_2 = SeedTraceClient::V2::AsyncV2Client.new(request_client: @async_request_client)
      @admin = SeedTraceClient::AsyncAdminClient.new(request_client: @async_request_client)
      @homepage = SeedTraceClient::AsyncHomepageClient.new(request_client: @async_request_client)
      @migration = SeedTraceClient::AsyncMigrationClient.new(request_client: @async_request_client)
      @playlist = SeedTraceClient::AsyncPlaylistClient.new(request_client: @async_request_client)
      @problem = SeedTraceClient::AsyncProblemClient.new(request_client: @async_request_client)
      @submission = SeedTraceClient::AsyncSubmissionClient.new(request_client: @async_request_client)
      @sysprop = SeedTraceClient::AsyncSyspropClient.new(request_client: @async_request_client)
    end
  end
end
