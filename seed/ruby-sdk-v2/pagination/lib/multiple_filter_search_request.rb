# frozen_string_literal: true

module Complex
    module Types
        class MultipleFilterSearchRequest < Internal::Types::Model
            field :operator, Array, optional: true, nullable: true
            field :value, Array, optional: true, nullable: true
        end
    end
end
