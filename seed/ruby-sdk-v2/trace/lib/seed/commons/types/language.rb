# frozen_string_literal: true

require_relative "../.."

module Seed
  module Commons
    module Types
      module Language
        extend Seed::Internal::Types::Enum

        JAVA = "JAVA"
        JAVASCRIPT = "JAVASCRIPT"
        PYTHON = "PYTHON"
      end
    end
  end
end
