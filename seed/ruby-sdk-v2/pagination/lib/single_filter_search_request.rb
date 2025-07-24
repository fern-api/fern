# frozen_string_literal: true

module Complex
    module Types
        class SingleFilterSearchRequest < Internal::Types::Model
            field :field, Array, optional: true, nullable: true
            field :operator, Array, optional: true, nullable: true
            field :value, Array, optional: true, nullable: true
        end
    end
end
