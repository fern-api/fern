# frozen_string_literal: true

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        class WithCursor < Internal::Types::Model
          field :cursor, -> { String }, optional: true, nullable: false
        end
      end
    end
  end
end
