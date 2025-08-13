# frozen_string_literal: true

module Seed
    module Types
        class T < Internal::Types::Model
            field :child, Seed::Ast::TorU, optional: false, nullable: false

    end
end
