# frozen_string_literal: true

module Foo
    module Types
        class FilteredType < Internal::Types::Model
            field :public_property, Array, optional: true, nullable: true
            field :private_property, Integer, optional: true, nullable: true
        end
    end
end
