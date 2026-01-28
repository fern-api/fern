# frozen_string_literal: true

module FernExamples
  module File
    module Service
      class Client
        # @param client [FernExamples::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # This endpoint returns a file by its name.
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :filename
        #
        # @return [FernExamples::Types::Types::File]
        def get_file(request_options: {}, **params)
          params = FernExamples::Internal::Types::Utils.normalize_keys(params)
          request = FernExamples::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/file/#{params[:filename]}",
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise FernExamples::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            FernExamples::Types::Types::File.load(response.body)
          else
            error_class = FernExamples::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end
      end
    end
  end
end
