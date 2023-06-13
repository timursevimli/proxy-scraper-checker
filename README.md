
# Proxy Scraper

Proxy Scraper is a tool that allows you to check the connectivity to HTTP, HTTPS, SOCKS4, and SOCKS5 proxy servers, as well as collect IP addresses and ports from websites specified in a text file.


## Installation 

To install and use Proxy Scraper, follow these steps:

1. Clone the repository using the command:
```bash 
  git clone https://github.com/timursevimli/proxy-scraper/
```

## Usage

To use Proxy Scraper, follow these steps:

1. Create a text file that lists the websites to collect IP addresses and ports from. Each URL should be specified on a separate line. For example (sources/proxy_sources.txt):
```bash
https://example.com
http://example.net
```
2. Edit the config.json file to configure the script execution and proxy checking options.
```javascript
{
  "executionType": "single", // or "multi"
  "timeout": 10000,
  "source": "proxy_sources.txt",
  "test": false // or true
}
```
3. Run the script by executing the command:
```bash
  npm start
```
4. The logs will be recorded in the logs/proxy-scraper.log file. You can view the log file to track the execution and check for results or errors.
## Execution Options

When running the proxy-scaper, you can specify the following options:

* executionType (default: 'single'): The type of proxy checking execution. Available values are 'single' for sequential checking and 'multi' for parallel checking.

* timeout (default: 10000): The timeout for each proxy check in milliseconds.

* source (default: 'proxy_sources.txt'): The path to the file containing the websites to collect IP addresses and ports from.

* test (default: false): A flag indicating whether to run in test mode (checking only a few websites).

## Contribution

You can contribute to the development of Proxy Scraper by creating new features, fixing bugs, or improving the documentation. If you have any suggestions, please feel free to open an issue or submit a pull request.


## License

This project is licensed under the [MIT LICENSE](https://github.com/timursevimli/proxy-scraper/blob/main/LICENSE)

  
