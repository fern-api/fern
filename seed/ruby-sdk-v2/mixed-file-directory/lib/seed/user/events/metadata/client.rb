# frozen_string_literal: true

module Seed
  module User
    module Events
      module Metadata
        class Client
          # @return [Seed::User::Events::Metadata::Client]
          def initialize(client:)
            @client = client
          end

          # Get event metadata.
          #
          # @return [Seed::User::Events::Metadata::Types::Metadata]
          def get_metadata(request_options: {}, **params)
            _query_param_names = ["id"]
            _query = params.slice(*_query_param_names)
            params.except(*_query_param_names)

            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
              method: "GET",
              path: "/users/events/metadata/",
              query: _query
            )
            _response = @client.send(_request)
            if _response.code >= "200" && _response.code < "300"
              return Seed::User::Events::Metadata::Types::Metadata.load(_response.body)
            end

            raise _response.body
          end
        end
      end
    end
  end
end
