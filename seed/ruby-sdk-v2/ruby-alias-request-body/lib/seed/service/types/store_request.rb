# frozen_string_literal: true

require_relative "../.."

module Seed
  module Service
    module Types
      class StoreRequest < Internal::Types::Model
        field :display_name, -> { String }, optional: false, nullable: false, api_name: "displayName"
      end
    end
  end
end
