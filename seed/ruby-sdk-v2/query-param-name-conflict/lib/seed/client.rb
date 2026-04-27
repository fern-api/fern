# frozen_string_literal: true

module Seed
  class Client
    # @param request_options [Hash]
    # @param params [Seed::Types::BulkUpdateTasksRequest]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    # @option params [String, nil] :filter_assigned_to
    # @option params [String, nil] :filter_is_complete
    # @option params [String, nil] :filter_date
    # @option params [String, nil] :fields
    #
    # @return [Seed::Types::BulkUpdateTasksResponse]
    def bulk_update_tasks(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      request_data = Seed::Types::BulkUpdateTasksRequest.new(params).to_h
      non_body_param_names = %w[assigned_to is_complete date _fields]
      body = request_data.except(*non_body_param_names)

      query_param_names = %i[filter_assigned_to filter_is_complete filter_date fields]
      query_params = {}
      query_params["assigned_to"] = params[:filter_assigned_to] if params.key?(:filter_assigned_to)
      query_params["is_complete"] = params[:filter_is_complete] if params.key?(:filter_is_complete)
      query_params["date"] = params[:filter_date] if params.key?(:filter_date)
      query_params["_fields"] = params[:fields] if params.key?(:fields)
      params.except(*query_param_names)

      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "PUT",
        path: "task/",
        query: query_params,
        body: body,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::BulkUpdateTasksResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_query-param-name-conflict/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end
  end
end
