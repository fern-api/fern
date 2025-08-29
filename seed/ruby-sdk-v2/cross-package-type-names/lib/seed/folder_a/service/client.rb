# frozen_string_literal: true

module Seed
  module FolderA
    module Service
      class Client
        # @return [Seed::FolderA::Service::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::FolderA::Service::Types::Response]
        def get_direct_thread(request_options: {}, **_params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: ""
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::FolderA::Service::Types::Response.load(_response.body)
          end

          raise _response.body
        end
      end
    end
  end
end
