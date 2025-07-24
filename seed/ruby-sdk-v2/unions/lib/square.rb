# frozen_string_literal: true

module Union
    module Types
        class Square < Internal::Types::Model
            field :length, Float, optional: true, nullable: true
        end
    end
end
