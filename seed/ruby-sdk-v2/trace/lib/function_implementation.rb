# frozen_string_literal: true

module V2
    module Types
        class FunctionImplementation < Internal::Types::Model
            field :impl, String, optional: true, nullable: true
            field :imports, Array, optional: true, nullable: true
        end
    end
end
