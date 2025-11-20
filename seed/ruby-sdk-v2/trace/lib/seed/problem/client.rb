# frozen_string_literal: true

module Seed
  module Problem
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Creates a problem
      #
      # @param request_options [Hash[untyped, untyped]]
      # @param params [Seed::Problem::Types::CreateProblemRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Seed::Problem::Types::CreateProblemResponse]
      def create_problem(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "POST",
          path: "/problem-crud/create",
          body: Seed::Problem::Types::CreateProblemRequest.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Problem::Types::CreateProblemResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Updates a problem
      #
      # @param request_options [Hash[untyped, untyped]]
      # @param params [Seed::Problem::Types::CreateProblemRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Seed::Commons::Types::ProblemId] :problem_id
      #
      # @return [Seed::Problem::Types::UpdateProblemResponse]
      def update_problem(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "POST",
          path: "/problem-crud/update/#{params[:problem_id]}",
          body: Seed::Problem::Types::CreateProblemRequest.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Problem::Types::UpdateProblemResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # Soft deletes a problem
      #
      # @param request_options [Hash[untyped, untyped]]
      # @param params [Hash[untyped, untyped]]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [Seed::Commons::Types::ProblemId] :problem_id
      #
      # @return [untyped]
      def delete_problem(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "DELETE",
          path: "/problem-crud/delete/#{params[:problem_id]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # Returns default starter files for problem
      #
      # @param request_options [Hash[untyped, untyped]]
      # @param params [Seed::Problem::Types::GetDefaultStarterFilesRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Seed::Problem::Types::GetDefaultStarterFilesResponse]
      def get_default_starter_files(request_options: {}, **params)
        _body_prop_names = %i[input_params output_type method_name]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "POST",
          path: "/problem-crud/default-starter-files",
          body: Seed::Problem::Types::GetDefaultStarterFilesRequest.new(_body_bag).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Problem::Types::GetDefaultStarterFilesResponse.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
