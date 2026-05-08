# frozen_string_literal: true

module Seed
  module ReqWithHeaders
    module Types
      class GetWithCustomHeaderReqWithHeadersRequest < Internal::Types::Model
        field :test_endpoint_header, -> { String }, optional: false, nullable: false, api_name: "X-TEST-ENDPOINT-HEADER"

        field :body, -> { String }, optional: false, nullable: false
      end
    end
  end
end
