# frozen_string_literal: true

require_relative "../../../../seed"

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        class WithPage < Internal::Types::Model
          field :page, -> { Integer }, optional: true, nullable: false
        end
      end
    end
  end
end
