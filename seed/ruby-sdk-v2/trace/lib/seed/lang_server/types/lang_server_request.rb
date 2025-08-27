# frozen_string_literal: true

module Seed
  module LangServer
    module Types
      class LangServerRequest < Internal::Types::Model
        field :request, -> { Internal::Types::Hash[String, Object] }, optional: false, nullable: false
      end
    end
  end
end
