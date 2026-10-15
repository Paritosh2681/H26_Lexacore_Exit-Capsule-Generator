import os
import requests
import yaml
from requests import get as fetch_url
from utils import format_payload

class ServiceClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def fetch_data(self, endpoint: str):
        # Call on imported alias/binding
        resp = fetch_url(f"{self.base_url}/{endpoint}")
        return resp.status_code

    def post_config(self, config_yaml: str):
        # Call on imported module
        data = yaml.safe_load(config_yaml)
        return requests.post(f"{self.base_url}/config", json=data)

def parse_yaml_text(raw_text: str):
    return yaml.safe_load(raw_text)

def run_main():
    client = ServiceClient("https://example.com/api")
    return client
