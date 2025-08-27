# frozen_string_literal: true

module Seed
  module FolderD
    module Service
      class Client
        # @return [Seed::FolderD::Service::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::FolderD::Service::Types::Response]
        def get_direct_thread(request_options: {}, **_params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/partner-path"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::FolderD::Service::Types::Response.load(_response.body)
          end

          raise _response.body
        end
      end
    end
  end
end
