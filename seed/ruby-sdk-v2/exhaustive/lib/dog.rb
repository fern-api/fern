# frozen_string_literal: true

module Types
    module Types
        class Dog < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :likes_to_woof, Boolean, optional: true, nullable: true
        end
    end
end
