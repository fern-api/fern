# frozen_string_literal: true

module Union
    module Types
        class Circle < Internal::Types::Model
            field :radius, Float, optional: true, nullable: true
        end
    end
end
