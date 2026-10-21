# frozen_string_literal: true

require_relative "../.."

module Seed
  module LangServer
    module Types
      class LangServerRequest < Internal::Types::Model
        field :request, -> { Object }, optional: false, nullable: false
      end
    end
  end
end
