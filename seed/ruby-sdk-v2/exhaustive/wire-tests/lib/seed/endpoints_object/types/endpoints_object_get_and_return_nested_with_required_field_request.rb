# frozen_string_literal: true

module Seed
  module EndpointsObject
    module Types
      class EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest < Internal::Types::Model
        field :string, -> { String }, optional: false, nullable: false
        field :body, -> { Seed::Types::TypesNestedObjectWithRequiredField }, optional: false, nullable: false
      end
    end
  end
end
