# frozen_string_literal: true

require "test_helper"
require "tempfile"

describe <%= gem_namespace %>::Internal::Multipart::FormData do
  FormData = <%= gem_namespace %>::Internal::Multipart::FormData

  describe "#add_file" do
    it "reads the file contents and filename from a path string" do
      Tempfile.create(["upload", ".json"]) do |tempfile|
        tempfile.binmode
        tempfile.write("{\"users\":[]}")
        tempfile.flush

        form_data = FormData.new
        form_data.add_file(name: "users", file: tempfile.path, content_type: "application/json")

        part = form_data.parts.first

        assert_equal "users", part.name
        assert_equal "{\"users\":[]}", part.contents
        assert_equal File.basename(tempfile.path), part.filename
        assert_equal({ "Content-Type" => "application/json" }, part.headers)

        body = form_data.encode

        assert_includes body, "filename=\"#{File.basename(tempfile.path)}\""
        assert_includes body, "{\"users\":[]}"
        refute_includes body, tempfile.path
      end
    end

    it "reads the file contents and filename from a File object" do
      Tempfile.create(["upload", ".txt"]) do |tempfile|
        tempfile.write("hello")
        tempfile.flush

        form_data = FormData.new
        File.open(tempfile.path, "rb") do |file|
          form_data.add_file(name: "file", file: file)
        end

        part = form_data.parts.first

        assert_equal "hello", part.contents
        assert_equal File.basename(tempfile.path), part.filename
        assert_nil part.headers
      end
    end

    it "reads readable objects and honors an explicit filename" do
      form_data = FormData.new
      form_data.add_file(name: "file", file: StringIO.new("data"), filename: "custom.bin")

      part = form_data.parts.first

      assert_equal "data", part.contents
      assert_equal "custom.bin", part.filename
    end

    it "adds one part per file" do
      Tempfile.create("a") do |first|
        Tempfile.create("b") do |second|
          first.write("first")
          first.flush
          second.write("second")
          second.flush

          form_data = FormData.new
          [first.path, second.path].each { |path| form_data.add_file(name: "files", file: path) }

          assert_equal %w[first second], form_data.parts.map(&:contents)
          assert_equal %w[files files], form_data.parts.map(&:name)
        end
      end
    end
  end
end
