# frozen_string_literal: true

module Seed
  module User
    module Events
      module Metadata
        class Client
          # @param client [Seed::Internal::Http::RawClient]
          #
          # @return [void]
          def initialize(client:)
            @client = client
          end

          # Get event metadata.
          #
          # @param request_options [Hash[untyped, untyped]]
          # @param params [Hash[untyped, untyped]]
          # @option request_options [String] :base_url
          # @option request_options [Hash{String => Object}] :additional_headers
          # @option request_options [Hash{String => Object}] :additional_query_parameters
          # @option request_options [Hash{String => Object}] :additional_body_parameters
          # @option request_options [Integer] :timeout_in_seconds
          # @option params [Seed::Types::Id] :id
          #
          # @return [Seed::User::Events::Metadata::Types::Metadata]
          def get_metadata(request_options: {}, **params)
            params = Seed::Internal::Types::Utils.symbolize_keys(params)
            _query_param_names = %i[id]
            _query = {}
            _query["id"] = params[:id] if params.key?(:id)
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
