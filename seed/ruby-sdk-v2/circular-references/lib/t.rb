# frozen_string_literal: true

module Ast
    module Types
        class T < Internal::Types::Model
            field :child, TorU, optional: true, nullable: true
        end
    end
end
