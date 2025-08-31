# frozen_string_literal: true

module Seed
  module Reference
    module Types
      class ContainerObject < Internal::Types::Model
        field :nested_objects, lambda {
          Internal::Types::Array[Seed::Reference::Types::NestedObjectWithLiterals]
        }, optional: false, nullable: false
      end
    end
  end
end
