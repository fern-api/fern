# frozen_string_literal: true

module FernExhaustive
  module ReqWithHeaders
    module Types
      class ReqWithHeaders < Internal::Types::Model
        field :x_test_endpoint_header, -> { String }, optional: false, nullable: false, api_name: "X-TEST-ENDPOINT-HEADER"
        field :body, -> { String }, optional: false, nullable: false
      end
    end
  end
end
