# frozen_string_literal: true

module FernNullableRequestBody
  module TestGroup
    module Types
      class TestMethodNameTestGroupRequest < Internal::Types::Model
        field :path_param, -> { String }, optional: false, nullable: false
        field :query_param_object, -> { FernNullableRequestBody::Types::PlainObject }, optional: true, nullable: false
        field :query_param_integer, -> { Integer }, optional: true, nullable: false
        field :body, -> { FernNullableRequestBody::Types::PlainObject }, optional: false, nullable: true
      end
    end
  end
end
