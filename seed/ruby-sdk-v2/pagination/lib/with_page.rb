# frozen_string_literal: true

module Users
    module Types
        class WithPage < Internal::Types::Model
            field :page, Array, optional: true, nullable: true
        end
    end
end
