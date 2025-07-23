# frozen_string_literal: true

module Union
    module Types
        class TypeWithOptionalUnion < Internal::Types::Model
            field :my_union, Array, optional: true, nullable: true
        end
    end
end
