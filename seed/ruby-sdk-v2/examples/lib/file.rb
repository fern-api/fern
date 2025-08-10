# frozen_string_literal: true

module Types
    module Types
        class File < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :contents, String, optional: true, nullable: true
        end
    end
end
