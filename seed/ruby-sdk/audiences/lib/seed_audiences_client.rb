# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "seed_audiences_client/folder_a/client"
require_relative "seed_audiences_client/foo/client"

module SeedAudiencesClient
  class Client
    attr_reader :folder_a, :foo

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @folder_a = FolderA::Client.new(request_client: @request_client)
      @foo = FooClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    attr_reader :folder_a, :foo

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = AsyncRequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @folder_a = FolderA::AsyncClient.new(request_client: @async_request_client)
      @foo = AsyncFooClient.new(request_client: @async_request_client)
    end
  end
end
