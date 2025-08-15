# frozen_string_literal: true

module Seed
    module Types
        class Memo < Internal::Types::Model
            field :description, String, optional: false, nullable: false
            field :account, Seed::Account, optional: true, nullable: false
        end
    end
end
