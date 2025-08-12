# frozen_string_literal: true

module Package
    module Types
        class Package < Internal::Types::Model
            field :name, String, optional: true, nullable: true
        end
    end
end
