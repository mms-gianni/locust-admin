locustfile = {
    "apiVersion": "v1",
    "kind": "ConfigMap",
    "metadata": {
        "labels": {
            "app.kubernetes.io/instance": "my-locust",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/name": "locust",
            "app.kubernetes.io/version": "2.1.0",
            "helm.sh/chart": "locust-0.20.1",
            "config": "locustfile"
        },
        "name": "my-locust-locustfile"
    },
    "data": {
        "main.py": "# -*- coding: utf-8 -*-\n\nfrom locust import HttpUser, task, between\nfrom lib.example_functions import choose_random_page\n\n\ndefault_headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'}\n\n\nclass WebsiteUser(HttpUser):\n    wait_time = between(1, 2)\n\n    @task(1)\n    def get_index(self):\n        self.client.get(\"/\", headers=default_headers)\n\n    @task(3)\n    def get_random_page(self):\n        self.client.get(choose_random_page(), headers=default_headers)\n"
    }
}

module.exports = locustfile;