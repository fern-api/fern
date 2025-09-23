# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Errors
      class ConstraintError < StandardError
      end
    end
  end
end 