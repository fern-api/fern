# frozen_string_literal: true

require_relative "seed_audiences_client/commons/types/imported"
require_relative "seed_audiences_client/folder_a/service/types/response"
require_relative "seed_audiences_client/folder_b/common/types/foo"
require_relative "seed_audiences_client/folder_c/common/types/foo"
require_relative "seed_audiences_client/foo/types/filtered_type"
require_relative "seed_audiences_client/foo/types/importing_type"
require_relative "seed_audiences_client/foo/types/optional_string"
require "faraday"
require_relative "seed_audiences_client/folder_a/service/client"
require_relative "seed_audiences_client/folder_aclient"
require_relative "seed_audiences_client/foo/client"
require "async/http/faraday"

module SeedAudiencesClient
  class Client
    attr_reader :client, :foo_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @client = FolderA::Client.new(request_client: request_client)
      @foo_client = Foo::FooClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_client, :async_foo_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_client = FolderA::AsyncClient.new(client: request_client)
      @async_foo_client = Foo::AsyncFooClient.new(request_client: request_client)
    end
  end
end
