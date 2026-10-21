# frozen_string_literal: true

require_relative "../.."

module Seed
  module Users
    module Types
      class UsernameContainer < Internal::Types::Model
        field :results, -> { Internal::Types::Array[String] }, optional: false, nullable: false
      end
    end
  end
end
