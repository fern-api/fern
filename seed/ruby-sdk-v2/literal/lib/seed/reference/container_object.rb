# frozen_string_literal: true

module Seed
    module Types
        class ContainerObject < Internal::Types::Model
            field :nested_objects, Internal::Types::Array[Seed::Reference::NestedObjectWithLiterals], optional: false, nullable: false

    end
end
