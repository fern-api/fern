# frozen_string_literal: true

module Seed
  module EndpointsHTTPMethods
    module Types
      class EndpointsHTTPMethodsTestPutRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :body, -> { Seed::Types::TypesObjectWithRequiredField }, optional: false, nullable: false
      end
    end
  end
end
