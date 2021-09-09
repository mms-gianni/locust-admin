lib = {
    "apiVersion": "v1",
    "kind": "ConfigMap",
    "metadata": {
        "labels": {
            "app.kubernetes.io/instance": "my-locust",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/name": "locust",
            "app.kubernetes.io/version": "2.1.0",
            "helm.sh/chart": "locust-0.20.1",
            "config": "lib"
        },
        "name": "my-locust-lib",
    },
    "data": {
        "__init__.py": "# -*- coding: utf-8 -*-\n",
        "example_functions.py": "# -*- coding: utf-8 -*-\n\nimport random\n\n\ndef choose_random_page():\n    pages = [\n        '/policies/privacy/',\n        '/contact/',\n        '/about/',\n        '/search/howsearchworks/crawling-indexing/',\n        '/search/howsearchworks/algorithms/'\n    ]\n\n    return random.choice(pages)\n"
    }
}

module.exports = lib;