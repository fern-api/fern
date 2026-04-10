# frozen_string_literal: true

module Seed
  module EndpointsHTTPMethods
    module Types
      class EndpointsHTTPMethodsTestPatchRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :body, -> { Seed::Types::TypesObjectWithOptionalField }, optional: false, nullable: false
      end
    end
  end
end
