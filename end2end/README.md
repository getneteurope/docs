# Selenium End2End Tests

## Run
First, start the Selenium Hub and the Selenium Nodes via `docker-compose`:
```sh
rake selenium:up
```

Then, run the tests:
```sh
rake selenium:test
```

The Selenium Hub + Nodes will continue to run in the background.
To shut it down, run:
```sh
rake selenium:down
```

## Tests

The tests are located in `end2end/tests` and use the predefined testing structure from `framework.rb` while
being packaged in a `minitest` test case:
```ruby
class TestHome < Minitest::Test
  def test_home
    title = E2ETests.run do |browser|
      browser.navigate.to 'https://doc.wirecard.com'
      browser.title
    end
    assert_equal('Home - Wirecard Documentation', title)
  end
end
```

The `E2ETests#run` method may be called with an argument specifying which browser to use:
* Firefox: `E2ETests.run(:firefox)`
* Chrome: `E2ETests.run(:chrome)`
