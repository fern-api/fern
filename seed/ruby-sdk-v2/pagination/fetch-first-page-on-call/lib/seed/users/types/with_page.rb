# frozen_string_literal: true

require_relative "../.."

module Seed
  module Users
    module Types
      class WithPage < Internal::Types::Model
        field :page, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
