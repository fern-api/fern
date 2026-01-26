# frozen_string_literal: true

module FernLiteral
  module Reference
    module Types
      class ContainerObject < Internal::Types::Model
        field :nested_objects, -> { Internal::Types::Array[FernLiteral::Reference::Types::NestedObjectWithLiterals] }, optional: false, nullable: false, api_name: "nestedObjects"
      end
    end
  end
end
