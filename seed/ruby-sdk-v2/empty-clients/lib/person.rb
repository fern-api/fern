# frozen_string_literal: true

module Level1
    module Types
        class Person < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :address, Address, optional: true, nullable: true
        end
    end
end
