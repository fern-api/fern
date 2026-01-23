# frozen_string_literal: true

module FernTrace
  module Problem
    class Client
      # @param client [FernTrace::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # Creates a problem
      #
      # @param request_options [Hash]
      # @param params [FernTrace::Problem::Types::CreateProblemRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernTrace::Problem::Types::CreateProblemResponse]
      def create_problem(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/problem-crud/create",
          body: FernTrace::Problem::Types::CreateProblemRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernTrace::Problem::Types::CreateProblemResponse.load(response.body)
        else
          error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Updates a problem
      #
      # @param request_options [Hash]
      # @param params [FernTrace::Problem::Types::CreateProblemRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Commons::Types::ProblemId] :problem_id
      #
      # @return [FernTrace::Problem::Types::UpdateProblemResponse]
      def update_problem(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/problem-crud/update/#{params[:problem_id]}",
          body: FernTrace::Problem::Types::CreateProblemRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernTrace::Problem::Types::UpdateProblemResponse.load(response.body)
        else
          error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # Soft deletes a problem
      #
      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [FernTrace::Commons::Types::ProblemId] :problem_id
      #
      # @return [untyped]
      def delete_problem(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "DELETE",
          path: "/problem-crud/delete/#{params[:problem_id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # Returns default starter files for problem
      #
      # @param request_options [Hash]
      # @param params [FernTrace::Problem::Types::GetDefaultStarterFilesRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernTrace::Problem::Types::GetDefaultStarterFilesResponse]
      def get_default_starter_files(request_options: {}, **params)
        params = FernTrace::Internal::Types::Utils.normalize_keys(params)
        body_prop_names = %i[input_params output_type method_name]
        body_bag = params.slice(*body_prop_names)

        request = FernTrace::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/problem-crud/default-starter-files",
          body: FernTrace::Problem::Types::GetDefaultStarterFilesRequest.new(body_bag).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernTrace::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernTrace::Problem::Types::GetDefaultStarterFilesResponse.load(response.body)
        else
          error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
