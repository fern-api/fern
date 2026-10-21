# frozen_string_literal: true

require_relative "../.."

module Seed
  module Optional
    module Types
      class SendOptionalBodyRequest < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
      end
    end
  end
end
