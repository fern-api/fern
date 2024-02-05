# frozen_string_literal: true
require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "seed_trace_client/v_2/client"
require_relative "seed_trace_client/admin/client"
require_relative "seed_trace_client/homepage/client"
require_relative "seed_trace_client/migration/client"
require_relative "seed_trace_client/playlist/client"
require_relative "seed_trace_client/problem/client"
require_relative "seed_trace_client/submission/client"
require_relative "seed_trace_client/sysprop/client"
require_relative "requests"

module SeedTraceClient
  class Client
    attr_reader :, :admin, :homepage, :migration, :playlist, :problem, :submission, :sysprop
    # @param environment [Environment] 
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long] 
    # @param token [String] 
    # @param x_random_header [String] 
    # @return [Client]
    def initialize(environment: Environment::PROD, max_retries: nil, timeout_in_seconds: nil, token:, x_random_header: nil)
      @request_client = RequestClient.new(environment: environment, max_retries: max_retries, timeout_in_seconds: timeout_in_seconds, token: token, x_random_header: x_random_header)
      @ = V2::Client.new(request_client: @request_client)
      @admin = AdminClient.new(request_client: @request_client)
      @homepage = HomepageClient.new(request_client: @request_client)
      @migration = MigrationClient.new(request_client: @request_client)
      @playlist = PlaylistClient.new(request_client: @request_client)
      @problem = ProblemClient.new(request_client: @request_client)
      @submission = SubmissionClient.new(request_client: @request_client)
      @sysprop = SyspropClient.new(request_client: @request_client)
    end
  end
  class AsyncClient
    attr_reader :, :admin, :homepage, :migration, :playlist, :problem, :submission, :sysprop
    # @param environment [Environment] 
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long] 
    # @param token [String] 
    # @param x_random_header [String] 
    # @return [AsyncClient]
    def initialize(environment: Environment::PROD, max_retries: nil, timeout_in_seconds: nil, token:, x_random_header: nil)
      @async_request_client = AsyncRequestClient.new(environment: environment, max_retries: max_retries, timeout_in_seconds: timeout_in_seconds, token: token, x_random_header: x_random_header)
      @ = V2::AsyncClient.new(request_client: @async_request_client)
      @admin = AsyncAdminClient.new(request_client: @async_request_client)
      @homepage = AsyncHomepageClient.new(request_client: @async_request_client)
      @migration = AsyncMigrationClient.new(request_client: @async_request_client)
      @playlist = AsyncPlaylistClient.new(request_client: @async_request_client)
      @problem = AsyncProblemClient.new(request_client: @async_request_client)
      @submission = AsyncSubmissionClient.new(request_client: @async_request_client)
      @sysprop = AsyncSyspropClient.new(request_client: @async_request_client)
    end
  end
end