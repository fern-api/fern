
module Seed
    module Admin
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Admin::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def update_test_submission_status(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/admin/store-test-submission-status/#{params[:submissionId]}"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # @return [untyped]
            def send_test_submission_update(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/admin/store-test-submission-status-v2/#{params[:submissionId]}"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # @return [untyped]
            def update_workspace_submission_status(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/admin/store-workspace-submission-status/#{params[:submissionId]}"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # @return [untyped]
            def send_workspace_submission_update(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/admin/store-workspace-submission-status-v2/#{params[:submissionId]}"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # @return [untyped]
            def store_traced_test_case(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # @return [untyped]
            def store_traced_test_case_v_2(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/admin/store-test-trace-v2/submission/#{params[:submissionId]}/testCase/#{params[:testCaseId]}"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # @return [untyped]
            def store_traced_workspace(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # @return [untyped]
            def store_traced_workspace_v_2(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/admin/store-workspace-trace-v2/submission/#{params[:submissionId]}"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

    end
end
