# frozen_string_literal: true

module FernMixedFileDirectory
  module User
    module Events
      module Metadata
        class Client
          # @param client [FernMixedFileDirectory::Internal::Http::RawClient]
          #
          # @return [void]
          def initialize(client:)
            @client = client
          end

          # Get event metadata.
          #
          # @param request_options [Hash]
          # @param params [Hash]
          # @option request_options [String] :base_url
          # @option request_options [Hash{String => Object}] :additional_headers
          # @option request_options [Hash{String => Object}] :additional_query_parameters
          # @option request_options [Hash{String => Object}] :additional_body_parameters
          # @option request_options [Integer] :timeout_in_seconds
          # @option params [FernMixedFileDirectory::Types::Id] :id
          #
          # @return [FernMixedFileDirectory::User::Events::Metadata::Types::Metadata]
          def get_metadata(request_options: {}, **params)
            params = FernMixedFileDirectory::Internal::Types::Utils.normalize_keys(params)
            query_param_names = %i[id]
            query_params = {}
            query_params["id"] = params[:id] if params.key?(:id)
            params.except(*query_param_names)

            request = FernMixedFileDirectory::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/users/events/metadata/",
              query: query_params,
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise FernMixedFileDirectory::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              FernMixedFileDirectory::User::Events::Metadata::Types::Metadata.load(response.body)
            else
              error_class = FernMixedFileDirectory::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end
      end
    end
  end
end
