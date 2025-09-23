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
            _query_param_names = [
              ["id"],
              %i[id]
            ].flatten
            _query = params.slice(*_query_param_names)
            params.except(*_query_param_names)

            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/users/events/metadata/",
              query: _query
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::User::Events::Metadata::Types::Metadata.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end
      end
    end
  end
end
