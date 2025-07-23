# frozen_string_literal: true

module Api
    module Types
        class Memo < Internal::Types::Model
            field :description, String, optional: true, nullable: true
            field :account, Array, optional: true, nullable: true
        end
    end
end
