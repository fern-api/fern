# frozen_string_literal: true

require_relative "../.."

module Seed
  module Users
    module Types
      class WithCursor < Internal::Types::Model
        field :cursor, -> { String }, optional: true, nullable: false
      end
    end
  end
end
