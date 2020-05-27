require 'minitest/autorun'
require_relative "../framework.rb"

class TestNginx < Minitest::Test
  def test_nginx
    title = E2ETests.run do |browser|
      # browser.navigate.to 'http://nginx/'
      browser.navigate.to 'http://nginx/index.html'
      browser.title
    end
    assert_equal('Wirecard Documentation', title)
  end
end
