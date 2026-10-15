import unittest
from app import parse_yaml_text, ServiceClient

class TestSampleApp(unittest.TestCase):
    def test_parse_yaml(self):
        sample = "name: exit-capsule\nversion: 1.0"
        data = parse_yaml_text(sample)
        self.assertEqual(data["name"], "exit-capsule")
        self.assertEqual(data["version"], 1.0)

    def test_client_init(self):
        client = ServiceClient("http://localhost:8080")
        self.assertEqual(client.base_url, "http://localhost:8080")

if __name__ == "__main__":
    unittest.main()
