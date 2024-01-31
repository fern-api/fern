# frozen_string_literal: true

require "faraday"
require_relative "v_2/client"
require_relative "admin/client"
require_relative "homepage/client"
require_relative "migration/client"
require_relative "playlist/client"
require_relative "problem/client"
require_relative "submission/client"
require_relative "sysprop/client"
require "async/http/faraday"

module SeedTraceClient
  class Client
    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @param x_random_header [String]
    # @return []
    def initialize(environment: Environment::PROD, max_retries: nil, timeout_in_seconds: nil, token: nil,
                   x_random_header: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @client = Client.initialize(request_client: request_client)
      @admin_client = AdminClient.initialize(request_client: request_client)
      @homepage_client = HomepageClient.initialize(request_client: request_client)
      @migration_client = MigrationClient.initialize(request_client: request_client)
      @playlist_client = PlaylistClient.initialize(request_client: request_client)
      @problem_client = ProblemClient.initialize(request_client: request_client)
      @submission_client = SubmissionClient.initialize(request_client: request_client)
      @sysprop_client = SyspropClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @param x_random_header [String]
    # @return []
    def initialize(environment: Environment::PROD, max_retries: nil, timeout_in_seconds: nil, token: nil,
                   x_random_header: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_client = AsyncClient.initialize(request_client: request_client)
      @async_admin_client = AsyncAdminClient.initialize(request_client: request_client)
      @async_homepage_client = AsyncHomepageClient.initialize(request_client: request_client)
      @async_migration_client = AsyncMigrationClient.initialize(request_client: request_client)
      @async_playlist_client = AsyncPlaylistClient.initialize(request_client: request_client)
      @async_problem_client = AsyncProblemClient.initialize(request_client: request_client)
      @async_submission_client = AsyncSubmissionClient.initialize(request_client: request_client)
      @async_sysprop_client = AsyncSyspropClient.initialize(request_client: request_client)
    end
  end
end
